import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useState} from "react";
import {Card} from "@coreModule/components/ui/card.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {Bid} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/bid/bid.dto.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import {IconBriefcase, IconClock} from "@tabler/icons-react";
import BidSheetView from "@eCommerceMarketplaceModule/clients/panel/private/bids/center/sheetView/bidSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import AcceptBidDropdown from "@eCommerceMarketplaceModule/clients/panel/private/bids/center/actions/acceptBidDropdown.tsx";
import RejectBidDropdown from "@eCommerceMarketplaceModule/clients/panel/private/bids/center/actions/rejectBidDropdown.tsx";
import BidActionConfirmAction from "@eCommerceMarketplaceModule/components/custom/bids/bidActionConfirmAction.tsx";

function formatAmount(bid: Bid): string | undefined {
    if (bid.amount == null) return undefined;
    const c = bid.currency;
    const prefix = c?.symbol?.trim() || c?.abbreviation?.trim();
    const n = bid.amount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2});
    return prefix ? `${prefix} ${n}` : n;
}

const STATUS_CONFIG: Record<string, {band: string; badge: string; dot: string; dotAnim: string; text: string}> = {
    pending:  {band: "bg-violet-500",  badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",  dot: "bg-violet-500",  dotAnim: "animate-pulse", text: "text-violet-700 dark:text-violet-400"},
    accepted: {band: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", dot: "bg-emerald-500", dotAnim: "",             text: "text-emerald-700 dark:text-emerald-400"},
    rejected: {band: "bg-rose-500",    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",          dot: "bg-muted-foreground/40", dotAnim: "",        text: "text-muted-foreground"},
};

type BidCardProps = WithLanguageType & {
    bid: Bid;
    onDelete?: (deleted?: Bid, response?: DeletedData) => void;
    onRestore?: () => void;
    onBidUpdated?: (bid: Bid) => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function BidCard({
    bid: bidProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    onBidUpdated,
    hideActions = false,
    sheetOnly = false,
}: BidCardProps) {
    const [action, setAction] = useState<string>("");
    const [bid, setBid] = useState<Bid>(bidProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(bid, data);
        } else {
            setBid({...bid, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setBid({...bid, deletedAt: undefined, deletedBy: undefined});
        }
    };

    const {read, restore} = useAccess("marketplacebids");

    useEffect(() => {
        setBid(bidProp);
    }, [bidProp]);

    if (hideAfterDeletion) return <></>;
    if (!restore && bid.deletedAt != null) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const amountStr = formatAmount(bid);
    const statusCfg = STATUS_CONFIG[bid.status] ?? STATUS_CONFIG.pending;
    const bidderInitials = [bid.bidder?.name?.[0], bid.bidder?.surname?.[0]]
        .filter(Boolean).join("").toUpperCase();

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
                    {/* ── Status accent band ────────────────────────────── */}
                    <div className={cn("h-1 w-full", statusCfg.band)} />

                    {/* ── Deleted banner ────────────────────────────────── */}
                    {(read.deletedBy || read.deletedAt) && (
                        <DeletedInfo deletedAt={bid.deletedAt} deletedBy={bid.deletedBy} />
                    )}

                    {/* ── Content ───────────────────────────────────────── */}
                    <div className="p-3 flex flex-col gap-2">

                        {/* Status badge + action menu */}
                        <div className="flex items-center justify-between gap-2">
                            {read?.status && bid.status && (
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                                    statusCfg.badge,
                                )}>
                                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusCfg.dot, statusCfg.dotAnim)} />
                                    {resolveLanguageKey("statuses." + bid.status)}
                                </span>
                            )}
                            {!hideActions && (
                                <div className="shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                                    <ActionMenu
                                        accessModel="marketplacebids"
                                        deletedData={bid}
                                        onAction={(a: string) => setAction(a)}
                                        editPath=""
                                        allowMenuForCustomChildren
                                    >
                                        <AcceptBidDropdown bid={bid} onAction={(a: string) => setAction(a)} />
                                        <RejectBidDropdown bid={bid} onAction={(a: string) => setAction(a)} />
                                    </ActionMenu>
                                </div>
                            )}
                        </div>

                        {/* Bidder */}
                        {read?.bidder && bid.bidder && (
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                                    <span className="text-[9px] font-bold text-primary leading-none">
                                        {bidderInitials || "?"}
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-muted-foreground truncate">
                                    {bid.bidder.name} {bid.bidder.surname}
                                </span>
                            </div>
                        )}

                        {/* Task request reference */}
                        {read?.taskRequest && bid.taskRequest?.title && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                                <IconBriefcase className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate font-medium">{bid.taskRequest.title}</span>
                            </div>
                        )}

                        {/* Proposal excerpt */}
                        {read?.proposal && bid.proposal && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-normal">
                                {bid.proposal}
                            </p>
                        )}

                        {/* Divider */}
                        <div className="h-px bg-border" />

                        {/* Footer: delivery | amount */}
                        <div className="flex items-end justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                {read?.deliveryDays && bid.deliveryDays != null && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded-full">
                                        <IconClock className="w-3 h-3" />
                                        {bid.deliveryDays}d
                                    </span>
                                )}
                            </div>

                            {read?.amount && amountStr && (
                                <div className="shrink-0 text-right ml-auto">
                                    <div className="text-[9px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                                        {resolveLanguageKey("offer")}
                                    </div>
                                    <span className="font-bold text-base text-foreground leading-none">{amountStr}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <BidSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            bid={bid}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onBidUpdated={(updated: Bid) => setBid(updated)}
                            onSheetRowPatched={(patch: Partial<Bid>) => setBid({...bid, ...patch})}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="marketplacebids"
                            deleteId={bid._id}
                            openAlert={action === "delete"}
                            name={bid.name}
                            confirmName={bid.name}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerceMarketplace/bid"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="marketplacebids"
                            deleteId={bid._id}
                            openAlert={action === "restore"}
                            name={bid.name}
                            confirmName={bid.name}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerceMarketplace/bid/restore"
                        />
                    )}
                    {(action === "accept" || action === "reject") && (
                        <BidActionConfirmAction
                            bidId={bid._id}
                            displayName={bid.name}
                            actionKey={action}
                            openAlert
                            url={`/api/eCommerceMarketplace/bid/${action}`}
                            onSuccess={(updated: Bid) => {
                                setBid(updated);
                                onBidUpdated?.(updated);
                                setAction("");
                            }}
                            onCancel={() => setAction("")}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/bids/center/cardView/bidCard.tsx"),
    withDebug(true, true),
)(BidCard);
