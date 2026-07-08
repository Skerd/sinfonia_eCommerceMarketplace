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
import { IconClock, IconUser } from "@tabler/icons-react";
import type { ProviderAvailability } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerAvailability/providerAvailability.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import ProviderAvailabilitySheetView from "@eCommerceMarketplaceModule/clients/panel/private/providerAvailability/center/sheetView/providerAvailabilitySheetView.tsx";

type ProviderAvailabilityCardProps = WithLanguageType & {
    availability: ProviderAvailability;
    onDelete?: (deleted?: ProviderAvailability, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function ProviderAvailabilityCard({
    availability: availProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: ProviderAvailabilityCardProps) {
    const [action, setAction] = useState("");
    const [avail, setAvail] = useState<ProviderAvailability>(availProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);
    const { read, restore } = useAccess("providerAvailabilities");

    useEffect(() => { setAvail(availProp); }, [availProp]);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else {
            if (onDeleteProp) onDeleteProp(avail, data);
            else setAvail({ ...avail, ...(data as any) });
        }
    };
    const onRestore = () => { if (onRestoreProp) onRestoreProp(); };

    if (hideAfterDeletion || !restore) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const dayName = resolveLanguageKey(`weekday.${avail.dayOfWeek}`);
    const providerName = avail.provider?.fullName || avail.provider?.name;

    const editPath = (() => {
        const params = new URLSearchParams();
        params.set("availabilityId", avail._id);
        return `/eCommerce/provideravailability/edit?${params.toString()}`;
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
                    <div className="h-1 w-full bg-primary/60" />

                    {(read as any).deletedBy && (
                        <DeletedInfo deletedAt={(avail as any).deletedAt} deletedBy={(avail as any).deletedBy} />
                    )}

                    <div className="p-3 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm text-foreground">{dayName}</h3>
                            {!hideActions && (
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <ActionMenu
                                        accessModel="providerAvailabilities"
                                        deletedData={avail as any}
                                        onAction={(a: string) => setAction(a)}
                                        editPath={editPath}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-border" />

                        <div className="flex items-center justify-between gap-2">
                            {providerName ? (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground min-w-0 truncate">
                                    <IconUser className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{providerName}</span>
                                </span>
                            ) : <span />}

                            <div className="flex items-center gap-2 shrink-0 ml-auto">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                    <IconClock className="w-3 h-3" />
                                    {avail.startTime} – {avail.endTime}
                                </span>
                                {avail.timezone && (
                                    <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                                        {avail.timezone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {action === "view" && (
                <ProviderAvailabilitySheetView
                    open
                    onOpenChange={() => setAction("")}
                    availability={avail}
                    fetchId={avail._id}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(patch) => setAvail({ ...avail, ...patch })}
                />
            )}
            {action === "delete" && (
                <DeleteAction accessModel="providerAvailabilities" deleteId={avail._id} openAlert onSuccess={onDelete} onCancel={() => setAction("")} url="/api/eCommerceMarketplace/providerAvailability" />
            )}
            {action === "restore" && (
                <RestoreAction accessModel="providerAvailabilities" deleteId={avail._id} openAlert onSuccess={onRestore} onCancel={() => setAction("")} url="/api/eCommerceMarketplace/providerAvailability/restore" />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/providerAvailability/center/cardView/providerAvailabilityCard.tsx"),
    withDebug(true, true),
)(ProviderAvailabilityCard);
