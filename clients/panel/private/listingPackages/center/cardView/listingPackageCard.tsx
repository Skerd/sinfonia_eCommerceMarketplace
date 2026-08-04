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
import type { ListingPackage } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listingPackage/listingPackage.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import ListingPackageSheetView from "@eCommerceMarketplaceModule/clients/panel/private/listingPackages/center/sheetView/listingPackageSheetView.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

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
    const [pkg, setEntity] = useState<ListingPackage>(pkgProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);
    const { read, restore } = useAccess("listingPackages");

    useEffect(() => { setEntity(pkgProp); }, [pkgProp]);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else {
            if (onDeleteProp) onDeleteProp(pkg, data);
            else setEntity({ ...pkg, ...(data as any) });
        }
    };
    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setEntity({
                ...pkg,
                deletedAt: undefined,
                deletedBy: undefined,
            } as ListingPackage);
        }
    };

    if (hideAfterDeletion) return <></>;
    if (!restore && (pkg as any).deletedAt != null) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const editPath = (() => {
        const params = new URLSearchParams();
        params.set("listingPackageId", pkg._id);
        return `/eCommerceMarketplace/listingpackages/edit?${params.toString()}`;
    })();

    const currencyPrefix = pkg.price?.currency?.symbol?.trim() || pkg.price?.currency?.abbreviation?.trim();
    const priceDisplay =
        pkg.price?.amount != null
            ? `${currencyPrefix ?? ""}${pkg.price.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
            : undefined;
    const canReadProviderName = !!(read?.provider?.keys?.name || read?.provider?.keys?.surname);
    const providerName = [
        read?.provider?.keys?.name ? pkg.provider?.name : "",
        read?.provider?.keys?.surname ? pkg.provider?.surname : "",
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return (
        <>
            <EntityCardShell onClick={() => setAction("view")}>
                {(read.deletedBy || read.deletedAt) && (
                    <DeletedInfo deletedAt={(pkg as any).deletedAt} deletedBy={(pkg as any).deletedBy} />
                )}

                <div className="p-3 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <HiddenElement randomLength={10}>
                                {!!read?.name ? (
                                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground min-w-0">
                                        {pkg.name || <ValueNotSet />}
                                    </h3>
                                ) : null}
                            </HiddenElement>
                            <HiddenElement randomLength={read?.order ? 0 : 4}>
                                {!!read?.order && pkg.order != null ? (
                                    <span className="shrink-0 text-3xs font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                        #{pkg.order}
                                    </span>
                                ) : null}
                            </HiddenElement>
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

                    {(!!pkg.description || !read?.description) && (
                        <HiddenElement randomLength={read?.description ? 0 : 16}>
                            {!!read?.description && pkg.description ? (
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-normal">{pkg.description}</p>
                            ) : null}
                        </HiddenElement>
                    )}

                    <div className="h-px bg-border" />

                    <HiddenElement randomLength={canReadProviderName ? 0 : 10}>
                        {canReadProviderName && pkg.provider ? (
                            <span className="text-xs font-medium text-muted-foreground truncate">
                                {providerName || "—"}
                            </span>
                        ) : null}
                    </HiddenElement>

                    <div className="flex items-end justify-between gap-2">
                        <HiddenElement randomLength={read?.listing?.keys?.title ? 0 : 10}>
                            {!!read?.listing?.keys?.title && pkg.listing?.title ? (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground min-w-0 truncate">
                                    <IconLayoutList className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{pkg.listing.title}</span>
                                </span>
                            ) : null}
                        </HiddenElement>

                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                            <HiddenElement randomLength={read?.deliveryDays ? 0 : 6}>
                                {!!read?.deliveryDays && pkg.deliveryDays != null ? (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                        <IconClock className="w-3 h-3" />
                                        {pkg.deliveryDays}{resolveLanguageKey("days")}
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
            </EntityCardShell>

            {action === "view" && (
                <ListingPackageSheetView
                    open
                    onOpenChange={() => setAction("")}
                    listingPackage={pkg}
                    fetchId={pkg._id}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(patch: Partial<ListingPackage>) => setEntity({...pkg, ...patch})}
                />
            )}
            {action === "delete" && (
                <DeleteAction
                    accessModel="listingPackages"
                    deleteId={pkg._id}
                    openAlert
                    name={read?.name && pkg.name}
                    confirmName={read?.name && pkg.name}
                    onSuccess={onDelete}
                    onCancel={() => setAction("")}
                    url="/api/eCommerceMarketplace/listingPackage"
                />
            )}
            {action === "restore" && (
                <RestoreAction
                    accessModel="listingPackages"
                    deleteId={pkg._id}
                    openAlert
                    name={read?.name && pkg.name}
                    confirmName={read?.name && pkg.name}
                    onSuccess={onRestore}
                    onCancel={() => setAction("")}
                    url="/api/eCommerceMarketplace/listingPackage/restore"
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/listingPackages/center/cardView/listingPackageCard.tsx"),
    withDebug(true, true),
)(ListingPackageCard);
