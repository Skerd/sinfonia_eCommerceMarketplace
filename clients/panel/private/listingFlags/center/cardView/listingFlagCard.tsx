import { compose } from "redux";
import { useEffect, useState } from "react";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import { useAccess } from "@coreModule/helpers/hocs/withAccess.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import { Card } from "@coreModule/components/ui/card.tsx";
import { cn } from "@coreModule/components/lib/utils.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import InfoRow from "@coreModule/components/custom/infoRow.tsx";
import { Flag, User } from "lucide-react";
import type { ListingFlag } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingFlag/listingFlag.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import ListingFlagSheetView from "@eCommerceMarketplaceModule/clients/panel/private/listingFlags/center/sheetView/listingFlagSheetView.tsx";

const STATUS_CONFIG: Record<string, { band: string; dot: string; text: string }> = {
    pending: {
        band: "bg-linear-to-r from-amber-400 to-amber-300",
        dot: "bg-amber-500",
        text: "text-amber-600",
    },
    reviewed: {
        band: "bg-linear-to-r from-blue-500 to-blue-400",
        dot: "bg-blue-500",
        text: "text-blue-600",
    },
    dismissed: {
        band: "bg-linear-to-r from-slate-400 to-slate-300",
        dot: "bg-muted-foreground/40",
        text: "text-muted-foreground",
    },
};

type ListingFlagCardProps = WithLanguageType & {
    listingFlag: ListingFlag;
    onDelete?: (deleted?: ListingFlag, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function formatReporterName(flag: ListingFlag): string {
    const { name, surname, fullName } = flag.user ?? {};
    if (fullName?.trim()) return fullName.trim();
    const combined = [name, surname].filter(Boolean).join(" ").trim();
    return combined || "—";
}

function formatEnumLabel(
    resolveLanguageKey: (key: string) => unknown,
    group: "status_values" | "reason_values",
    value?: string,
): string {
    if (!value) return "—";
    return (resolveLanguageKey(`${group}.${value}`) as string | undefined) ?? value;
}

function ListingFlagCard({
    listingFlag: flagProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: ListingFlagCardProps) {
    const [action, setAction] = useState("");
    const [flag, setFlag] = useState<ListingFlag>(flagProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);
    const { read, restore } = useAccess("listingflags");

    useEffect(() => {
        setFlag(flagProp);
    }, [flagProp]);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(flag, data);
        } else {
            setFlag({ ...flag, ...(data as Partial<ListingFlag>) });
        }
    };

    const onRestore = () => {
        if (onRestoreProp) onRestoreProp();
    };

    if (hideAfterDeletion) return <></>;
    if (!restore && flag.deletedAt != null) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const statusCfg = STATUS_CONFIG[flag.status] ?? STATUS_CONFIG.dismissed;
    const listingTitle = flag.listing?.title?.trim() || "—";
    const statusLabel = formatEnumLabel(resolveLanguageKey, "status_values", flag.status);
    const reasonLabel = formatEnumLabel(resolveLanguageKey, "reason_values", flag.reason);
    const reporterName = formatReporterName(flag);

    const editPath = (() => {
        const params = new URLSearchParams();
        params.set("listingFlagId", flag._id);
        return `/eCommerce/listingflags/edit?${params.toString()}`;
    })();

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn(
                        "group p-0 h-full relative overflow-hidden transition-all duration-300",
                        "hover:shadow-xl hover:cursor-pointer",
                        "border border-border/60 shadow-sm gap-0",
                    )}
                    onClick={() => setAction("view")}
                >
                    <div className={cn("h-1 w-full", statusCfg.band)} />

                    {(read.deletedBy || read.deletedAt) && (
                        <DeletedInfo deletedAt={flag.deletedAt} deletedBy={flag.deletedBy} />
                    )}

                    <div className="p-3 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground min-h-[2.5rem] flex-1 min-w-0">
                                {listingTitle}
                            </h3>
                            {!hideActions && (
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <ActionMenu
                                        accessModel="listingflags"
                                        deletedData={flag}
                                        onAction={(a: string) => setAction(a)}
                                        editPath={editPath}
                                    />
                                </div>
                            )}
                        </div>

                        <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide -mt-1", statusCfg.text)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusCfg.dot)} />
                            {statusLabel}
                        </span>

                        <InfoRow icon={Flag} label={resolveLanguageKey("reason")} value={reasonLabel} />
                        <InfoRow icon={User} label={resolveLanguageKey("reporter")} value={reporterName} />
                    </div>
                </Card>
            )}
            {action === "view" && (
                <ListingFlagSheetView
                    open
                    onOpenChange={() => setAction("")}
                    listingFlag={flag}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            {action === "delete" && (
                <DeleteAction
                    accessModel="listingflags"
                    deleteId={flag._id}
                    openAlert
                    onSuccess={onDelete}
                    onCancel={() => setAction("")}
                    url="/api/eCommerceMarketplace/listingFlag"
                />
            )}
            {action === "restore" && (
                <RestoreAction
                    accessModel="listingflags"
                    deleteId={flag._id}
                    openAlert
                    onSuccess={onRestore}
                    onCancel={() => setAction("")}
                    url="/api/eCommerceMarketplace/listingFlag/restore"
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/listingFlags/center/cardView/listingFlagCard.tsx"),
    withDebug(true, true),
)(ListingFlagCard);
