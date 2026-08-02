import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import type {Order} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/order/order.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import type {OrderStatus} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/order/order.schema-def.ts";
import OrderCard from "./center/cardView/orderCard.tsx";
import AcceptOrderDropdown from "./center/actions/acceptOrderDropdown.tsx";
import StartOrderDropdown from "./center/actions/startOrderDropdown.tsx";
import CancelOrderDropdown from "./center/actions/cancelOrderDropdown.tsx";
import ExtendOrderDropdown from "./center/actions/extendOrderDropdown.tsx";
import SubmitOrderDeliveryDropdown from "./center/actions/submitOrderDeliveryDropdown.tsx";
import AcceptOrderDeliveryDropdown from "./center/actions/acceptOrderDeliveryDropdown.tsx";
import RequestRevisionDropdown from "./center/actions/requestRevisionDropdown.tsx";
import RaiseDisputeDropdown from "@eCommerceMarketplaceModule/clients/panel/private/orders/center/actions/raiseDisputeDropdown.tsx";
import OrderActionConfirmAction from "@eCommerceMarketplaceModule/components/custom/orders/orderActionConfirmAction.tsx";
import OrderExtendAction from "@eCommerceMarketplaceModule/components/custom/orders/orderExtendAction.tsx";
import SubmitOrderDeliveryAction from "@eCommerceMarketplaceModule/components/custom/orders/submitOrderDeliveryAction.tsx";
import RequestRevisionAction from "@eCommerceMarketplaceModule/components/custom/orders/requestRevisionAction.tsx";
import RaiseDisputeAction from "@eCommerceMarketplaceModule/components/custom/disputes/raiseDisputeAction.tsx";

function orderDisplayLabel(order: Order): string {
    return order.listing?.title || order.taskRequest?.title || order._id;
}

function AllOrders({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Order>
            apiUrl="/api/eCommerceMarketplace/order"
            collectionName="orders"
            accessModel="orders"
            tableConfigKey="orders"
            buildEditPath={() => ""}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerceMarketplace/clients/panel/private/orders/center/sheetView/orderSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            rowActionMenu={{hideEdit: true, allowMenuForCustomChildren: true}}
            renderActionMenuChildren={(order, bindRowAction) => (
                <>
                    <AcceptOrderDropdown order={order} onAction={bindRowAction} />
                    <StartOrderDropdown order={order} onAction={bindRowAction} />
                    <CancelOrderDropdown order={order} onAction={bindRowAction} />
                    <ExtendOrderDropdown order={order} onAction={bindRowAction} />
                    <SubmitOrderDeliveryDropdown order={order} onAction={bindRowAction} />
                    <AcceptOrderDeliveryDropdown order={order} onAction={bindRowAction} />
                    <RequestRevisionDropdown order={order} onAction={bindRowAction} />
                    <RaiseDisputeDropdown order={order} onAction={bindRowAction} />
                </>
            )}
            renderFloatingModals={({action, entity, resetAction, listRef}) => {
                if (action === "submitDelivery") {
                    return (
                        <SubmitOrderDeliveryAction
                            orderId={entity._id}
                            displayName={orderDisplayLabel(entity)}
                            openAlert
                            url="/api/eCommerceMarketplace/order/submitDelivery"
                            onSuccess={() => {
                                listRef.current?.updateRow?.(entity._id, {
                                    deliverySubmitted: true,
                                } as Partial<Order>);
                                resetAction();
                            }}
                            onCancel={resetAction}
                        />
                    );
                }
                if (action === "extend") {
                    return (
                        <OrderExtendAction
                            orderId={entity._id}
                            displayName={orderDisplayLabel(entity)}
                            currentDueDate={entity.deliveryDueDate}
                            openAlert
                            url="/api/eCommerceMarketplace/order/extend"
                            onSuccess={(newDueDate) => {
                                listRef.current?.updateRow?.(entity._id, {
                                    deliveryDueDate: newDueDate,
                                } as Partial<Order>);
                                resetAction();
                            }}
                            onCancel={resetAction}
                        />
                    );
                }
                if (action === "requestRevision") {
                    return (
                        <RequestRevisionAction
                            orderId={entity._id}
                            displayName={orderDisplayLabel(entity)}
                            openAlert
                            url="/api/eCommerceMarketplace/order/requestRevision"
                            onSuccess={() => {
                                listRef.current?.updateRow?.(entity._id, {
                                    deliverySubmitted: false,
                                } as Partial<Order>);
                                resetAction();
                            }}
                            onCancel={resetAction}
                        />
                    );
                }
                if (action === "raiseDispute") {
                    return (
                        <RaiseDisputeAction
                            orderId={entity._id}
                            displayName={orderDisplayLabel(entity)}
                            openAlert
                            url="/api/eCommerceMarketplace/dispute"
                            onSuccess={() => {
                                listRef.current?.updateRow?.(entity._id, {hasActiveDispute: true} as Partial<Order>);
                                resetAction();
                            }}
                            onCancel={resetAction}
                        />
                    );
                }
                if (action !== "accept" && action !== "start" && action !== "cancel" && action !== "acceptDelivery") {
                    return null;
                }
                return (
                    <OrderActionConfirmAction
                        orderId={entity._id}
                        displayName={orderDisplayLabel(entity)}
                        actionKey={action}
                        openAlert
                        url={`/api/eCommerceMarketplace/order/${action}`}
                        onSuccess={(newStatus: OrderStatus) => {
                            listRef.current?.updateRow?.(entity._id, {status: newStatus} as Partial<Order>);
                            resetAction();
                        }}
                        onCancel={resetAction}
                    />
                );
            }}
            renderCard={(order, onDelete, onRestore, listRef) => (
                <OrderCard
                    order={order}
                    onDelete={(row, response?: DeletedData) => onDelete(row ?? order, response)}
                    onRestore={() => onRestore(order)}
                    onOrderUpdated={(updated) => listRef.current?.updateRow?.(order._id, updated as Partial<Order>)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/orders/index.tsx"),
    withDebug(true, true),
)(AllOrders);
