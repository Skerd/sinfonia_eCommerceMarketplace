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
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import { IconClock, IconLayoutList } from "@tabler/icons-react";
import type { ListingAddOn } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingAddOn/listingAddOn.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import ListingAddOnSheetView from "@eCommerceMarketplaceModule/clients/panel/private/listingAddOns/center/sheetView/listingAddOnSheetView.tsx";

type ListingAddOnCardProps = WithLanguageType & {
    listingAddOn: ListingAddOn;
    onDelete?: (deleted?: ListingAddOn, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
};

function ListingAddOnCard({
    listingAddOn: addOnProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
}: ListingAddOnCardProps) {
    const [action, setAction] = useState("");
    const [addOn, setAddOn] = useState<ListingAddOn>(addOnProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);
    const { read, restore } = useAccess("listingAddOns");

    useEffect(() => { setAddOn(addOnProp); }, [addOnProp]);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else {
            if (onDeleteProp) onDeleteProp(addOn, data);
            else setAddOn({ ...addOn, ...(data as any) });
        }
    };
    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setAddOn({
                ...addOn,
                deletedAt: undefined,
                deletedBy: undefined,
            } as ListingAddOn);
        }
    };

    if (hideAfterDeletion) return <></>;
    if (!restore && (addOn as any).deletedAt != null) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const editPath = (() => {
        const params = new URLSearchParams();
        params.set("listingAddOnId", addOn._id);
        return `/eCommerceMarketplace/listingaddons/edit?${params.toString()}`;
    })();

    const currencyPrefix = addOn.price?.currency?.symbol?.trim() || addOn.price?.currency?.abbreviation?.trim();
    const priceDisplay =
        addOn.price?.amount != null
            ? `${currencyPrefix ?? ""}${addOn.price.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
            : undefined;
    const canReadProviderName = !!(read?.provider?.keys?.name || read?.provider?.keys?.surname);
    const providerName = [
        read?.provider?.keys?.name ? addOn.provider?.name : "",
        read?.provider?.keys?.surname ? addOn.provider?.surname : "",
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return (
        <>
            <Card
                className={cn(
                    "group p-0 h-full relative overflow-hidden transition-all duration-300",
                    "hover:shadow-xl hover:cursor-pointer",
                    "border border-border/60 shadow-sm gap-0",
                )}
                onClick={() => setAction("view")}
            >
                {(read.deletedBy || read.deletedAt) && (
                    <DeletedInfo deletedAt={(addOn as any).deletedAt} deletedBy={(addOn as any).deletedBy} />
                )}

                <div className="p-3 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                        <HiddenElement randomLength={10}>
                            {!!read?.name ? (
                                <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground flex-1 min-w-0">
                                    {addOn.name || <ValueNotSet />}
                                </h3>
                            ) : null}
                        </HiddenElement>
                        {!hideActions && (
                            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                <ActionMenu
                                    accessModel="listingAddOns"
                                    deletedData={addOn as any}
                                    onAction={(a: string) => setAction(a)}
                                    editPath={editPath}
                                />
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-border" />

                    <HiddenElement randomLength={canReadProviderName ? 0 : 10}>
                        {canReadProviderName && addOn.provider ? (
                            <span className="text-xs font-medium text-muted-foreground truncate">
                                {providerName || "—"}
                            </span>
                        ) : null}
                    </HiddenElement>

                    <div className="flex items-end justify-between gap-2">
                        <HiddenElement randomLength={read?.listing?.keys?.title ? 0 : 10}>
                            {!!read?.listing?.keys?.title && addOn.listing?.title ? (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground min-w-0 truncate">
                                    <IconLayoutList className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{addOn.listing.title}</span>
                                </span>
                            ) : null}
                        </HiddenElement>

                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                            <HiddenElement randomLength={read?.deliveryDays ? 0 : 6}>
                                {!!read?.deliveryDays && addOn.deliveryDays != null ? (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                        <IconClock className="w-3 h-3" />
                                        {addOn.deliveryDays}{resolveLanguageKey("days")}
                                    </span>
                                ) : null}
                            </HiddenElement>
                            <HiddenElement randomLength={read?.price ? 0 : 8}>
                                {!!read?.price && priceDisplay != null ? (
                                    <span className="font-bold text-base text-foreground leading-none">
                                        {priceDisplay}
                                    </span>
                                ) : null}
                            </HiddenElement>
                        </div>
                    </div>
                </div>
            </Card>

            {action === "view" && (
                <ListingAddOnSheetView
                    open
                    onOpenChange={() => setAction("")}
                    listingAddOn={addOn}
                    fetchId={addOn._id}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(patch: Partial<ListingAddOn>) => setAddOn({...addOn, ...patch})}
                />
            )}
            {action === "delete" && (
                <DeleteAction
                    accessModel="listingAddOns"
                    deleteId={addOn._id}
                    openAlert
                    name={read?.name && addOn.name}
                    confirmName={read?.name && addOn.name}
                    onSuccess={onDelete}
                    onCancel={() => setAction("")}
                    url="/api/eCommerceMarketplace/listingAddOn"
                />
            )}
            {action === "restore" && (
                <RestoreAction
                    accessModel="listingAddOns"
                    deleteId={addOn._id}
                    openAlert
                    name={read?.name && addOn.name}
                    confirmName={read?.name && addOn.name}
                    onSuccess={onRestore}
                    onCancel={() => setAction("")}
                    url="/api/eCommerceMarketplace/listingAddOn/restore"
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/listingAddOns/center/cardView/listingAddOnCard.tsx"),
    withDebug(true, true),
)(ListingAddOnCard);
