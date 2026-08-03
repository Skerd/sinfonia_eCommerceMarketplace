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
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import { Flag, User } from "lucide-react";
import type { ListingFlag } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingFlag/listingFlag.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import ListingFlagSheetView from "@eCommerceMarketplaceModule/clients/panel/private/listingFlags/center/sheetView/listingFlagSheetView.tsx";
import ResolveListingFlagDropdown from "@eCommerceMarketplaceModule/clients/panel/private/listingFlags/center/actions/resolveListingFlagDropdown.tsx";
import DismissListingFlagDropdown from "@eCommerceMarketplaceModule/clients/panel/private/listingFlags/center/actions/dismissListingFlagDropdown.tsx";
import ChangeListingFlagLifecycleAction, {
    type ListingFlagLifecycleVerb,
} from "@eCommerceMarketplaceModule/components/custom/listingFlags/changeListingFlagLifecycleAction.tsx";

const STATUS_CONFIG: Record<string, { dot: string; text: string }> = {
    pending: {
        dot: "bg-warning",
        text: "text-warning",
    },
    reviewed: {
        dot: "bg-info",
        text: "text-info",
    },
    dismissed: {
        dot: "bg-muted-foreground/40",
        text: "text-muted-foreground",
    },
};

type ListingFlagCardProps = WithLanguageType & {
    listingFlag: ListingFlag;
    onDelete?: (deleted?: ListingFlag, response?: DeletedData) => void;
    onRestore?: () => void;
    onLifecyclePatched?: (patch: Partial<ListingFlag>) => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

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
    onLifecyclePatched,
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

    const applyLifecyclePatch = (patch: Partial<ListingFlag>) => {
        setFlag((prev) => ({...prev, ...patch}));
        onLifecyclePatched?.(patch);
    };

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
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setFlag({
                ...flag,
                deletedAt: undefined,
                deletedBy: undefined,
            } as ListingFlag);
        }
    };

    if (hideAfterDeletion) return <></>;
    if (!restore && flag.deletedAt != null) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const statusCfg = STATUS_CONFIG[flag.status] ?? STATUS_CONFIG.dismissed;
    const canReadListingTitle = !!read?.listing?.keys?.title;
    const listingTitle = canReadListingTitle
        ? (flag.listing?.title?.trim() || "—")
        : undefined;
    const statusLabel = formatEnumLabel(resolveLanguageKey, "status_values", flag.status);
    const reasonLabel = formatEnumLabel(resolveLanguageKey, "reason_values", flag.reason);
    const canReadReporterName = !!(read?.user?.keys?.name || read?.user?.keys?.surname);
    const reporterName = [
        read?.user?.keys?.name ? flag.user?.name : "",
        read?.user?.keys?.surname ? flag.user?.surname : "",
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    const editPath = (() => {
        const params = new URLSearchParams();
        params.set("listingFlagId", flag._id);
        return `/eCommerceMarketplace/listingflags/edit?${params.toString()}`;
    })();

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn(
                        "group p-0 h-full relative overflow-hidden transition-[box-shadow,--tw-ring-color] duration-200",
                        "hover:cursor-pointer hover:shadow-md hover:ring-primary/40",
                        "shadow-sm gap-0",
                    )}
                    onClick={() => setAction("view")}
                >
                    {(read.deletedBy || read.deletedAt) && (
                        <DeletedInfo deletedAt={flag.deletedAt} deletedBy={flag.deletedBy} />
                    )}

                    <div className="p-3 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                            <HiddenElement randomLength={canReadListingTitle ? 0 : 12}>
                                {canReadListingTitle ? (
                                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground min-h-[2.5rem] flex-1 min-w-0">
                                        {listingTitle && listingTitle !== "—" ? listingTitle : <ValueNotSet />}
                                    </h3>
                                ) : null}
                            </HiddenElement>
                            {!hideActions && (
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <ActionMenu
                                        accessModel="listingflags"
                                        deletedData={flag}
                                        onAction={(a: string) => setAction(a)}
                                        editPath={editPath}
                                        hideEdit={flag.status !== "pending"}
                                        allowMenuForCustomChildren
                                    >
                                        <ResolveListingFlagDropdown listingFlag={flag} onAction={(a: string) => setAction(a)} />
                                        <DismissListingFlagDropdown listingFlag={flag} onAction={(a: string) => setAction(a)} />
                                    </ActionMenu>
                                </div>
                            )}
                        </div>

                        <HiddenElement randomLength={read?.status ? 0 : 6}>
                            {!!read?.status && flag.status ? (
                                <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide -mt-1", statusCfg.text)}>
                                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusCfg.dot)} />
                                    {statusLabel}
                                </span>
                            ) : null}
                        </HiddenElement>

                        <InfoRow
                            icon={Flag}
                            label={resolveLanguageKey("reason")}
                            show
                            value={
                                <HiddenElement randomLength={read?.reason ? 0 : 8}>
                                    {!!read?.reason ? reasonLabel : null}
                                </HiddenElement>
                            }
                        />
                        <InfoRow
                            icon={User}
                            label={resolveLanguageKey("reporter")}
                            show
                            value={
                                <HiddenElement randomLength={canReadReporterName ? 0 : 10}>
                                    {canReadReporterName ? (reporterName || "—") : null}
                                </HiddenElement>
                            }
                        />
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
                    onListLifecyclePatched={applyLifecyclePatch}
                />
            )}
            {(action === "resolve" || action === "dismiss") && (
                <ChangeListingFlagLifecycleAction
                    listingFlagId={flag._id}
                    listingFlagTitle={listingTitle}
                    verb={action as ListingFlagLifecycleVerb}
                    openAlert
                    url={`/api/eCommerceMarketplace/listingFlag/${action}`}
                    onSuccess={(patch: Partial<ListingFlag>) => {
                        applyLifecyclePatch(patch);
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
            {action === "delete" && (
                <DeleteAction
                    accessModel="listingflags"
                    deleteId={flag._id}
                    openAlert
                    name={canReadListingTitle && listingTitle}
                    confirmName={canReadListingTitle && listingTitle}
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
                    name={canReadListingTitle && listingTitle}
                    confirmName={canReadListingTitle && listingTitle}
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
