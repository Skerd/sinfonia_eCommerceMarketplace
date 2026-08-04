import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useState} from "react";
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
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

function formatAmount(bid: Bid): string | undefined {
    if (bid.amount == null) return undefined;
    const c = bid.currency;
    const prefix = c?.symbol?.trim() || c?.abbreviation?.trim();
    const n = bid.amount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2});
    return prefix ? `${prefix} ${n}` : n;
}

const STATUS_CONFIG: Record<string, {dot: string; dotAnim: string; text: string}> = {
    pending:  {dot: "bg-warning",            dotAnim: "animate-pulse", text: "text-warning"},
    accepted: {dot: "bg-success",          dotAnim: "",              text: "text-success"},
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
    const {action, setAction, entity: bid, setEntity, hideAfterDeletion, onDelete, onRestore} = useEntityCard({
        entityProp: bidProp,
        onDeleteProp,
        onRestoreProp,
    });

    const {read, restore} = useAccess("marketplacebids");


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
                <EntityCardShell onClick={() => setAction("view")}>
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
                                                <span className="text-3xs font-bold text-primary leading-none">
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
                                        "inline-flex items-center gap-1 text-3xs font-semibold uppercase tracking-wide shrink-0",
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
                </EntityCardShell>
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
                            onBidUpdated={(updated: Bid) => setEntity(updated)}
                            onSheetRowPatched={(patch: Partial<Bid>) => setEntity({...bid, ...patch})}
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
                                setEntity(updated);
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
