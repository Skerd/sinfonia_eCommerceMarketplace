import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
import {Card} from "@coreModule/components/ui/card.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Listing} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/listing/listing.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import {IconClock, IconFolder, IconMapPin, IconPhoto, IconSparkles} from "@tabler/icons-react";
import ListingSheetView from "@eCommerceMarketplaceModule/clients/panel/private/listings/center/sheetView/listingSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import ActivateListingDropdown from "@eCommerceMarketplaceModule/clients/panel/private/listings/center/actions/activateListingDropdown.tsx";
import DeactivateListingDropdown from "@eCommerceMarketplaceModule/clients/panel/private/listings/center/actions/deactivateListingDropdown.tsx";
import CreateOrderFromListingDropdown from "@eCommerceMarketplaceModule/clients/panel/private/listings/center/actions/createOrderFromListingDropdown.tsx";
import ChangeListingStatusAction from "@eCommerceMarketplaceModule/components/custom/listings/changeListingStatusAction.tsx";
import CreateOrderFromListingAction from "@eCommerceMarketplaceModule/components/custom/listings/createOrderFromListingAction.tsx";

function listingEditPath(listing: Listing) {
    const params = new URLSearchParams();
    params.set("listingId", listing._id);
    if (listing.title) params.set("listingTitle", listing.title);
    return `/eCommerceMarketplace/listings/edit?${params.toString()}`;
}

function formatPrice(listing: Listing): string | undefined {
    if (listing.price == null) return undefined;
    const c = listing.priceCurrency;
    const prefix = c?.symbol?.trim() || c?.abbreviation?.trim();
    const n = listing.price.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    return prefix ? `${prefix} ${n}` : n;
}

type ListingCardProps = WithLanguageType & {
    listing: Listing;
    onDelete?: (deleted?: Listing, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function ListingCard({
    listing: listingProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: ListingCardProps) {
    const [action, setAction] = useState<string>("");
    const [listing, setListing] = useState<Listing>(listingProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(listing, data);
        } else {
            setListing({...listing, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setListing({
                ...listing,
                deletedAt: undefined,
                deletedBy: undefined,
            });
        }
    };

    const {read, restore} = useAccess("listings");

    useEffect(() => {
        setListing(listingProp);
    }, [listingProp]);

    if (hideAfterDeletion) {
        return <></>;
    }
    if (!restore && listing.deletedAt != null) {
        return <></>;
    }
    if (!read || !Object.keys(read).length) {
        return <HiddenElement />;
    }

    const priceStr = formatPrice(listing);

    const isFeatured = listing.promotions?.some((p) => p.type === "featured");
    const isSponsored = listing.promotions?.some((p) => p.type === "sponsored");
    const canReadProviderName = !!(read?.provider?.keys?.name || read?.provider?.keys?.surname);
    const providerName = [
        read?.provider?.keys?.name ? listing.provider?.name : "",
        read?.provider?.keys?.surname ? listing.provider?.surname : "",
    ]
        .filter(Boolean)
        .join(" ")
        .trim();
    const providerInitials = [
        read?.provider?.keys?.name ? listing.provider?.name?.[0] : "",
        read?.provider?.keys?.surname ? listing.provider?.surname?.[0] : "",
    ]
        .filter(Boolean)
        .join("")
        .toUpperCase();

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn(
                        "group p-0 h-full relative overflow-hidden transition-[box-shadow,--tw-ring-color] duration-200",
                        "hover:cursor-pointer hover:shadow-md hover:ring-primary/40",
                        "border border-border/60 shadow-sm gap-2 pb-2",
                    )}
                    onClick={() => setAction("view")}
                >
                    {/* ── Image ─────────────────────────────────────────── */}
                    <div className="relative h-50 overflow-hidden bg-muted">
                        <HiddenElement randomLength={read?.mainImage ? 0 : 12}>
                            {!!read?.mainImage ? (
                                listing.mainImage ? (
                                    <img
                                        src={`/api/auxiliary/media/${listing.mainImage._id}`}
                                        alt={read?.title ? listing.title : ""}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted via-muted/70 to-muted/40">
                                        <IconPhoto className="w-14 h-14 text-muted-foreground/15" />
                                    </div>
                                )
                            ) : null}
                        </HiddenElement>

                        {/* Gradient scrim for bottom overlays */}
                        <div className="absolute inset-0 transform-gpu bg-linear-to-t from-black/65 via-black/10 to-transparent pointer-events-none" />

                        {/* Action menu */}
                        {!hideActions && (
                            <div
                                className="absolute top-2 right-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ActionMenu
                                    accessModel={"listings"}
                                    deletedData={listing}
                                    onAction={(a: string) => setAction(a)}
                                    editPath={listingEditPath(listing)}
                                    allowMenuForCustomChildren
                                >
                                    {listing.status !== "active" && !listing.deletedAt && (
                                        <ActivateListingDropdown onAction={(a: string) => setAction(a)} />
                                    )}
                                    {listing.status !== "inactive" && !listing.deletedAt && (
                                        <DeactivateListingDropdown onAction={(a: string) => setAction(a)} />
                                    )}
                                    <CreateOrderFromListingDropdown listing={listing} onAction={(a: string) => setAction(a)} />
                                </ActionMenu>
                            </div>
                        )}

                        {/* Bottom image row: category left, featured right */}
                        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
                            <HiddenElement randomLength={read?.category?.keys?.name ? 0 : 8}>
                                {!!read?.category?.keys?.name && listing.category?.name ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white border border-white/20 shadow-sm truncate max-w-[60%]">
                                        <IconFolder className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{listing.category.name}</span>
                                    </span>
                                ) : null}
                            </HiddenElement>
                            {(isFeatured || isSponsored || !read?.promotions) && (
                                <HiddenElement randomLength={read?.promotions ? 0 : 6}>
                                    {!!read?.promotions && (isFeatured || isSponsored) ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-warning/20 text-warning uppercase tracking-wide shadow-sm shrink-0 ml-auto">
                                            <IconSparkles className="w-3 h-3" />
                                            {isFeatured
                                                ? resolveLanguageKey("featured")
                                                : resolveLanguageKey("sponsored")}
                                        </span>
                                    ) : null}
                                </HiddenElement>
                            )}
                        </div>
                    </div>

                    {/* ── Deleted banner ────────────────────────────────── */}
                    {(read.deletedBy || read.deletedAt) && (
                        <DeletedInfo deletedAt={listing.deletedAt} deletedBy={listing.deletedBy} />
                    )}

                    {/* ── Content ───────────────────────────────────────── */}
                    <div className="px-3 py-1 flex flex-col gap-2">

                        {/* Provider row + status */}
                        <div className="flex items-center justify-between gap-2">
                            <HiddenElement randomLength={canReadProviderName ? 0 : 10}>
                                {canReadProviderName && listing.provider ? (
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                                            <span className="text-[9px] font-bold text-primary leading-none">
                                                {providerInitials || "?"}
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground truncate">
                                            {providerName || "—"}
                                        </span>
                                    </div>
                                ) : null}
                            </HiddenElement>
                            <HiddenElement randomLength={read?.status ? 0 : 6}>
                                {!!read?.status && listing.status ? (
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide shrink-0",
                                        listing.status === "active" ? "text-success" :
                                        listing.status === "inactive" ? "text-warning" :
                                        "text-muted-foreground",
                                    )}>
                                        <span className={cn(
                                            "w-1.5 h-1.5 rounded-full shrink-0",
                                            listing.status === "active" ? "bg-success animate-pulse" :
                                            listing.status === "inactive" ? "bg-warning" :
                                            "bg-muted-foreground/40",
                                        )} />
                                        {resolveLanguageKey("statuses." + listing.status)}
                                    </span>
                                ) : null}
                            </HiddenElement>
                        </div>

                        {/* Title */}
                        <HiddenElement randomLength={10}>
                            {!!read?.title ? (
                                <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground min-h-6">
                                    {listing.title || <ValueNotSet />}
                                </h3>
                            ) : null}
                        </HiddenElement>

                        {/* Description excerpt */}
                        {(!!listing.description || !read?.description) && (
                            <HiddenElement randomLength={read?.description ? 0 : 16}>
                                {!!read?.description && listing.description ? (
                                    <p className="text-xs text-muted-foreground line-clamp-1 leading-normal -mt-0.5">
                                        {listing.description}
                                    </p>
                                ) : null}
                            </HiddenElement>
                        )}

                        {/* Tags */}
                        {((listing.tags && listing.tags.length > 0) || !read?.tags) && (
                            <HiddenElement randomLength={read?.tags ? 0 : 12}>
                                {!!read?.tags && listing.tags && listing.tags.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {listing.tags.slice(0, 3).map((tag, i) => (
                                            <span
                                                key={i}
                                                className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80 font-medium"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                        {listing.tags.length > 3 && (
                                            <span className="text-[10px] text-muted-foreground font-medium self-center">
                                                +{listing.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                ) : null}
                            </HiddenElement>
                        )}

                        {/* Divider */}
                        <div className="h-px bg-border" />

                        {/* Footer: meta left | price right */}
                        <div className="flex items-end justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0 flex-wrap">
                                <HiddenElement randomLength={read?.address ? 0 : 8}>
                                    {!!read?.address && listing.address?.city?.name ? (
                                        <span className="flex items-center gap-1 truncate">
                                            <IconMapPin className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{listing.address.city.name}</span>
                                        </span>
                                    ) : null}
                                </HiddenElement>
                                <HiddenElement randomLength={read?.deliveryDays ? 0 : 6}>
                                    {!!read?.deliveryDays && listing.deliveryDays != null ? (
                                        <span className="flex items-center gap-1 shrink-0 bg-muted px-2 py-0.5 rounded-full">
                                            <IconClock className="w-3 h-3" />
                                            {listing.deliveryDays}{resolveLanguageKey("days")}
                                        </span>
                                    ) : null}
                                </HiddenElement>
                            </div>

                            <HiddenElement randomLength={read?.price ? 0 : 8}>
                                {!!read?.price && priceStr !== undefined ? (
                                    <div className="shrink-0 text-right">
                                        <div className="text-[9px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                                            {resolveLanguageKey("from")}
                                        </div>
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="font-bold text-base text-foreground leading-none">
                                                {priceStr}
                                            </span>
                                            {!!read?.pricingType && listing.pricingType === "hourly" && (
                                                <span className="text-[10px] text-muted-foreground">/{resolveLanguageKey("perHour")}</span>
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                            </HiddenElement>
                        </div>
                    </div>
                </Card>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <ListingSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            listing={listing}
                            fetchId={listing._id}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onSheetRowPatched={(patch: any) => setListing({...listing, ...patch})}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel={"listings"}
                            deleteId={listing._id}
                            openAlert={action === "delete"}
                            name={read?.title && listing.title}
                            confirmName={read?.title && listing.title}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerceMarketplace/listing"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel={"listings"}
                            deleteId={listing._id}
                            openAlert={action === "restore"}
                            name={read?.title && listing.title}
                            confirmName={read?.title && listing.title}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerceMarketplace/listing/restore"
                        />
                    )}
                    {(action === "activate" || action === "deactivate") && (
                        <ChangeListingStatusAction
                            listingId={listing._id}
                            listingTitle={read?.title ? listing.title : undefined}
                            targetStatus={action === "activate" ? "active" : "inactive"}
                            openAlert
                            url={`/api/eCommerceMarketplace/listing/${action}`}
                            onSuccess={(newStatus: string) => {
                                setListing({...listing, status: newStatus});
                                setAction("");
                            }}
                            onCancel={() => setAction("")}
                        />
                    )}
                    {action === "createOrderFromListing" && (
                        <CreateOrderFromListingAction
                            listingId={listing._id}
                            displayName={read?.title ? listing.title : undefined}
                            openAlert
                            url="/api/eCommerceMarketplace/order/createFromListing"
                            onSuccess={() => setAction("")}
                            onCancel={() => setAction("")}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/listings/center/cardView/listingCard.tsx"),
    withDebug(true, true),
)(ListingCard);
