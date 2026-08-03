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
import TableAvatar from "@coreModule/components/custom/avatar/tableAvatar.tsx";
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

const STATUS_CONFIG: Record<string, {dot: string; dotAnim: string; text: string}> = {
    pending:  {dot: "bg-amber-500",            dotAnim: "animate-pulse", text: "text-amber-600"},
    accepted: {dot: "bg-emerald-500",          dotAnim: "",              text: "text-emerald-600"},
    rejected: {dot: "bg-muted-foreground/40",  dotAnim: "",              text: "text-muted-foreground"},
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
    const taskTitle = bid.taskRequest?.title || bid.name || bid._id;
    const bidderName = [bid.bidder?.name, bid.bidder?.surname].filter(Boolean).join(" ").trim();
    const bidderInitials = [bid.bidder?.name?.[0], bid.bidder?.surname?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase();

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
                    {(read.deletedBy || read.deletedAt) && (
                        <DeletedInfo deletedAt={bid.deletedAt} deletedBy={bid.deletedBy} />
                    )}

                    <div className="p-3 flex flex-col gap-1.5">
                        {/* Bidder + status + menu */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                {read?.bidder && bid.bidder && (
                                    <>
                                        {bid.bidder.photo ? (
                                            <TableAvatar mediaId={bid.bidder.photo} />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                                                <span className="text-[8px] font-bold text-primary leading-none">
                                                    {bidderInitials || "?"}
                                                </span>
                                            </div>
                                        )}
                                        <span className="text-sm font-semibold text-foreground truncate">
                                            {bidderName || "—"}
                                        </span>
                                    </>
                                )}
                                {read?.status && bid.status && (
                                    <span className={cn(
                                        "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide shrink-0",
                                        statusCfg.text,
                                    )}>
                                        <span className={cn("w-1.5 h-1.5 rounded-full", statusCfg.dot, statusCfg.dotAnim)} />
                                        {resolveLanguageKey("statuses." + bid.status)}
                                    </span>
                                )}
                            </div>
                            {!hideActions && (
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
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

                        {/* Task + amount */}
                        <div className="flex items-end justify-between gap-2">
                            <span className="text-xs text-muted-foreground truncate min-w-0">
                                {taskTitle}
                            </span>
                            {read?.amount && amountStr && (
                                <span className="font-bold text-sm text-foreground shrink-0 leading-none">
                                    {amountStr}
                                </span>
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
