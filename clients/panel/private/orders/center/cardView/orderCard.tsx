import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {Card} from "@coreModule/components/ui/card.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import type {Order} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/order/order.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import OrderSheetView from "@eCommerceMarketplaceModule/clients/panel/private/orders/center/sheetView/orderSheetView.tsx";
import AcceptOrderDropdown from "@eCommerceMarketplaceModule/clients/panel/private/orders/center/actions/acceptOrderDropdown.tsx";
import StartOrderDropdown from "@eCommerceMarketplaceModule/clients/panel/private/orders/center/actions/startOrderDropdown.tsx";
import CancelOrderDropdown from "@eCommerceMarketplaceModule/clients/panel/private/orders/center/actions/cancelOrderDropdown.tsx";
import ExtendOrderDropdown from "@eCommerceMarketplaceModule/clients/panel/private/orders/center/actions/extendOrderDropdown.tsx";
import SubmitOrderDeliveryDropdown from "@eCommerceMarketplaceModule/clients/panel/private/orders/center/actions/submitOrderDeliveryDropdown.tsx";
import AcceptOrderDeliveryDropdown from "@eCommerceMarketplaceModule/clients/panel/private/orders/center/actions/acceptOrderDeliveryDropdown.tsx";
import RequestRevisionDropdown from "@eCommerceMarketplaceModule/clients/panel/private/orders/center/actions/requestRevisionDropdown.tsx";
import RaiseDisputeDropdown from "@eCommerceMarketplaceModule/clients/panel/private/orders/center/actions/raiseDisputeDropdown.tsx";
import OrderActionConfirmAction from "@eCommerceMarketplaceModule/components/custom/orders/orderActionConfirmAction.tsx";
import OrderExtendAction from "@eCommerceMarketplaceModule/components/custom/orders/orderExtendAction.tsx";
import SubmitOrderDeliveryAction from "@eCommerceMarketplaceModule/components/custom/orders/submitOrderDeliveryAction.tsx";
import RequestRevisionAction from "@eCommerceMarketplaceModule/components/custom/orders/requestRevisionAction.tsx";
import RaiseDisputeAction from "@eCommerceMarketplaceModule/components/custom/disputes/raiseDisputeAction.tsx";
import type {OrderConfirmActionKey} from "@eCommerceMarketplaceModule/components/custom/orders/orderActionConfirmAction.tsx";
import type {OrderStatus} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/order/order.schema-def.ts";
import {IconArrowRight, IconCalendar} from "@tabler/icons-react";

const STATUS_CONFIG: Record<string, {band: string; dot: string; dotAnim: string; text: string}> = {
    pending:     {band: "bg-linear-to-r from-amber-400 to-amber-300",   dot: "bg-amber-500",        dotAnim: "",             text: "text-amber-600"},
    accepted:    {band: "bg-linear-to-r from-blue-500 to-blue-400",     dot: "bg-blue-500",         dotAnim: "animate-pulse",text: "text-blue-600"},
    in_progress: {band: "bg-linear-to-r from-violet-500 to-violet-400", dot: "bg-violet-500",       dotAnim: "animate-pulse",text: "text-violet-600"},
    completed:   {band: "bg-linear-to-r from-emerald-500 to-emerald-400",dot: "bg-emerald-500",     dotAnim: "",             text: "text-emerald-600"},
    cancelled:   {band: "bg-linear-to-r from-rose-500 to-rose-400",     dot: "bg-muted-foreground/40",dotAnim: "",           text: "text-muted-foreground"},
};

type OrderCardProps = WithLanguageType & {
    order: Order;
    onDelete?: (deleted?: Order, response?: DeletedData) => void;
    onRestore?: () => void;
    onOrderUpdated?: (order: Order) => void;
    hideActions?: boolean;
};

function OrderCard({
    order: orderProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    onOrderUpdated,
    hideActions = false,
}: OrderCardProps) {
    const [action, setAction] = useState("");
    const [order, setOrder] = useState<Order>(orderProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);
    const {read, restore} = useAccess("orders");

    useEffect(() => {
        setOrder(orderProp);
    }, [orderProp]);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(order, data);
        } else {
            setOrder({...order, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setOrder({...order, deletedAt: undefined, deletedBy: undefined});
        }
    };

    if (hideAfterDeletion) return <></>;
    if (!restore && order.deletedAt != null) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const statusCfg = STATUS_CONFIG[order.status ?? ""] ?? STATUS_CONFIG.pending;

    const title = order.listing?.title || order.taskRequest?.title || order._id;

    const applyOrderUpdate = (patch: Partial<Order>) => {
        setOrder((prev) => {
            const updated = {...prev, ...patch};
            onOrderUpdated?.(updated);
            return updated;
        });
    };

    const amountStr = order.amount != null
        ? `${order.currency?.symbol?.trim() || order.currency?.abbreviation?.trim() || ""} ${order.amount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}`.trim()
        : null;

    const dueDateLabel = order.deliveryDueDate
        ? new Date(order.deliveryDueDate).toLocaleDateString(undefined, {day: "2-digit", month: "short", year: "numeric"})
        : null;

    const customerInitials = [order.customer?.name?.[0], order.customer?.surname?.[0]].filter(Boolean).join("").toUpperCase();
    const providerInitials = [order.provider?.name?.[0], order.provider?.surname?.[0]].filter(Boolean).join("").toUpperCase();

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
                {/* ── Status accent band ────────────────────────────── */}
                <div className={cn("h-1 w-full", statusCfg.band)} />

                {/* ── Deleted banner ────────────────────────────────── */}
                {(read.deletedBy || read.deletedAt) && (
                    <DeletedInfo deletedAt={order.deletedAt} deletedBy={order.deletedBy} />
                )}

                {/* ── Content ───────────────────────────────────────── */}
                <div className="p-3 flex flex-col gap-2">

                    {/* Title + action menu */}
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground min-h-[2.5rem] flex-1 min-w-0">
                            {title}
                        </h3>
                        {!hideActions && (
                            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                <ActionMenu
                                    accessModel="orders"
                                    deletedData={order}
                                    onAction={(a: string) => setAction(a)}
                                    editPath=""
                                    allowMenuForCustomChildren
                                >
                                    <AcceptOrderDropdown order={order} onAction={(a: string) => setAction(a)} />
                                    <StartOrderDropdown order={order} onAction={(a: string) => setAction(a)} />
                                    <CancelOrderDropdown order={order} onAction={(a: string) => setAction(a)} />
                                    <ExtendOrderDropdown order={order} onAction={(a: string) => setAction(a)} />
                                    <SubmitOrderDeliveryDropdown order={order} onAction={(a: string) => setAction(a)} />
                                    <AcceptOrderDeliveryDropdown order={order} onAction={(a: string) => setAction(a)} />
                                    <RequestRevisionDropdown order={order} onAction={(a: string) => setAction(a)} />
                                    <RaiseDisputeDropdown order={order} onAction={(a: string) => setAction(a)} />
                                </ActionMenu>
                            </div>
                        )}
                    </div>

                    {/* Status indicator */}
                    {read?.status && order.status && (
                        <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide -mt-1", statusCfg.text)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusCfg.dot, statusCfg.dotAnim)} />
                            {resolveLanguageKey("statuses." + order.status)}
                        </span>
                    )}

                    {/* Customer → Provider flow */}
                    {(read?.customer || read?.provider) && (order.customer || order.provider) && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                            {read?.customer && order.customer && (
                                <span className="flex items-center gap-1.5 min-w-0 truncate">
                                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 ring-1 ring-border">
                                        <span className="text-[8px] font-bold text-foreground leading-none">{customerInitials || "?"}</span>
                                    </div>
                                    <span className="truncate">{order.customer.fullName || `${order.customer.name} ${order.customer.surname}`}</span>
                                </span>
                            )}
                            {read?.customer && read?.provider && order.customer && order.provider && (
                                <IconArrowRight className="w-3 h-3 shrink-0 text-muted-foreground/40" />
                            )}
                            {read?.provider && order.provider && (
                                <span className="flex items-center gap-1.5 min-w-0 truncate">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                                        <span className="text-[8px] font-bold text-primary leading-none">{providerInitials || "?"}</span>
                                    </div>
                                    <span className="truncate">{order.provider.fullName || `${order.provider.name} ${order.provider.surname}`}</span>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-border" />

                    {/* Footer: due date | amount */}
                    <div className="flex items-end justify-between gap-2">
                        {read?.deliveryDueDate && dueDateLabel && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded-full">
                                <IconCalendar className="w-3 h-3" />
                                {dueDateLabel}
                            </span>
                        )}

                        {read?.amount && amountStr && (
                            <div className="shrink-0 text-right ml-auto">
                                <div className="text-[9px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                                    {resolveLanguageKey("total")}
                                </div>
                                <span className="font-bold text-base text-foreground leading-none">{amountStr}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {action === "view" && (
                <OrderSheetView
                    open
                    onOpenChange={() => setAction("")}
                    order={order}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onOrderUpdated={(updated) => applyOrderUpdate(updated)}
                    onSheetRowPatched={(patch) => applyOrderUpdate(patch)}
                />
            )}
            {action === "delete" && (
                <DeleteAction
                    accessModel="orders"
                    deleteId={order._id}
                    openAlert
                    onSuccess={onDelete}
                    onCancel={() => setAction("")}
                    url="/api/eCommerceMarketplace/order"
                />
            )}
            {action === "restore" && (
                <RestoreAction
                    accessModel="orders"
                    deleteId={order._id}
                    openAlert
                    onSuccess={onRestore}
                    onCancel={() => setAction("")}
                    url="/api/eCommerceMarketplace/order/restore"
                />
            )}
            {(action === "accept" || action === "start" || action === "cancel" || action === "acceptDelivery") && (
                <OrderActionConfirmAction
                    orderId={order._id}
                    displayName={title}
                    actionKey={action as OrderConfirmActionKey}
                    openAlert
                    url={`/api/eCommerceMarketplace/order/${action}`}
                    onSuccess={(newStatus: OrderStatus) => {
                        applyOrderUpdate({status: newStatus});
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
            {action === "submitDelivery" && (
                <SubmitOrderDeliveryAction
                    orderId={order._id}
                    displayName={title}
                    openAlert
                    url="/api/eCommerceMarketplace/order/submitDelivery"
                    onSuccess={() => {
                        applyOrderUpdate({deliverySubmitted: true});
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
            {action === "extend" && (
                <OrderExtendAction
                    orderId={order._id}
                    displayName={title}
                    currentDueDate={order.deliveryDueDate}
                    openAlert
                    url="/api/eCommerceMarketplace/order/extend"
                    onSuccess={(newDueDate) => {
                        applyOrderUpdate({deliveryDueDate: newDueDate});
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
            {action === "requestRevision" && (
                <RequestRevisionAction
                    orderId={order._id}
                    displayName={title}
                    openAlert
                    url="/api/eCommerceMarketplace/order/requestRevision"
                    onSuccess={() => {
                        applyOrderUpdate({deliverySubmitted: false});
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
            {action === "raiseDispute" && (
                <RaiseDisputeAction
                    orderId={order._id}
                    displayName={title}
                    openAlert
                    url="/api/eCommerceMarketplace/dispute"
                    onSuccess={() => {
                        applyOrderUpdate({hasActiveDispute: true});
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/orders/center/cardView/orderCard.tsx"),
    withDebug(true, true),
)(OrderCard);
