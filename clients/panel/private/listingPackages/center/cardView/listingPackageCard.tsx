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
import { IconClock, IconLayoutList } from "@tabler/icons-react";
import type { ListingPackage } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingPackage/listingPackage.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import ListingPackageSheetView from "@eCommerceMarketplaceModule/clients/panel/private/listingPackages/center/sheetView/listingPackageSheetView.tsx";

type ListingPackageCardProps = WithLanguageType & {
    listingPackage: ListingPackage;
    onDelete?: (deleted?: ListingPackage, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
};

function ListingPackageCard({
    listingPackage: pkgProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
}: ListingPackageCardProps) {
    const [action, setAction] = useState("");
    const [pkg, setPkg] = useState<ListingPackage>(pkgProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);
    const { read, restore } = useAccess("listingPackages");

    useEffect(() => { setPkg(pkgProp); }, [pkgProp]);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else {
            if (onDeleteProp) onDeleteProp(pkg, data);
            else setPkg({ ...pkg, ...(data as any) });
        }
    };
    const onRestore = () => { if (onRestoreProp) onRestoreProp(); };

    if (hideAfterDeletion || !restore) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const editPath = (() => {
        const params = new URLSearchParams();
        params.set("listingPackageId", pkg._id);
        return `/eCommerce/listingpackages/edit?${params.toString()}`;
    })();

    const currencyPrefix = pkg.price.currency?.symbol?.trim() || pkg.price.currency?.abbreviation?.trim();
    const priceDisplay = `${currencyPrefix ?? ""}${pkg.price.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

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
                <div className="h-1 w-full bg-primary/60" />

                {(read as any).deletedBy && (
                    <DeletedInfo deletedAt={(pkg as any).deletedAt} deletedBy={(pkg as any).deletedBy} />
                )}

                <div className="p-3 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground min-w-0">
                                {pkg.name}
                            </h3>
                            {pkg.order != null && (
                                <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                    #{pkg.order}
                                </span>
                            )}
                        </div>
                        {!hideActions && (
                            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                <ActionMenu
                                    accessModel="listingPackages"
                                    deletedData={pkg as any}
                                    onAction={(a: string) => setAction(a)}
                                    editPath={editPath}
                                />
                            </div>
                        )}
                    </div>

                    {pkg.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-normal">{pkg.description}</p>
                    )}

                    <div className="h-px bg-border" />

                    <div className="flex items-end justify-between gap-2">
                        {(read as any).listing && pkg.listing?.title && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground min-w-0 truncate">
                                <IconLayoutList className="w-3 h-3 shrink-0" />
                                <span className="truncate">{pkg.listing.title}</span>
                            </span>
                        )}

                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                <IconClock className="w-3 h-3" />
                                {pkg.deliveryDays}{resolveLanguageKey("days")}
                            </span>
                            <span className="font-bold text-base text-foreground leading-none">
                                {priceDisplay}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {action === "view" && (
                <ListingPackageSheetView
                    open
                    onOpenChange={() => setAction("")}
                    listingPackage={pkg}
                    fetchId={pkg._id}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(patch) => setPkg({...pkg, ...patch})}
                />
            )}
            {action === "delete" && (
                <DeleteAction accessModel="listingPackages" deleteId={pkg._id} openAlert onSuccess={onDelete} onCancel={() => setAction("")} url="/api/eCommerceMarketplace/listingPackage" />
            )}
            {action === "restore" && (
                <RestoreAction accessModel="listingPackages" deleteId={pkg._id} openAlert onSuccess={onRestore} onCancel={() => setAction("")} url="/api/eCommerceMarketplace/listingPackage/restore" />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/listingPackages/center/cardView/listingPackageCard.tsx"),
    withDebug(true, true),
)(ListingPackageCard);
