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
import type {Dispute} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/dispute/dispute.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import DisputeSheetView from "../sheetView/disputeSheetView.tsx";
import ChangeDisputeLifecycleAction from "@eCommerceMarketplaceModule/components/custom/disputes/changeDisputeLifecycleAction.tsx";
import StartReviewDisputeDropdown from "@eCommerceMarketplaceModule/clients/panel/private/disputes/center/actions/startReviewDisputeDropdown.tsx";
import ResolveDisputeDropdown from "@eCommerceMarketplaceModule/clients/panel/private/disputes/center/actions/resolveDisputeDropdown.tsx";
import CloseDisputeDropdown from "@eCommerceMarketplaceModule/clients/panel/private/disputes/center/actions/closeDisputeDropdown.tsx";
import type {DisputeLifecycleVerb} from "@eCommerceMarketplaceModule/components/custom/disputes/changeDisputeLifecycleAction.tsx";
import {IconPackage} from "@tabler/icons-react";

const STATUS_CONFIG: Record<string, {band: string; dot: string; dotAnim: string; text: string}> = {
    open:         {band: "bg-linear-to-r from-rose-500 to-rose-400",       dot: "bg-rose-500",            dotAnim: "animate-pulse", text: "text-rose-600"},
    under_review: {band: "bg-linear-to-r from-amber-400 to-amber-300",     dot: "bg-amber-500",           dotAnim: "animate-pulse", text: "text-amber-600"},
    resolved:     {band: "bg-linear-to-r from-emerald-500 to-emerald-400", dot: "bg-emerald-500",         dotAnim: "",              text: "text-emerald-600"},
    closed:       {band: "bg-linear-to-r from-slate-400 to-slate-300",     dot: "bg-muted-foreground/40", dotAnim: "",              text: "text-muted-foreground"},
};

type DisputeCardProps = WithLanguageType & {
    dispute: Dispute;
    onDelete?: (deleted?: Dispute, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
    /** When lifecycle changes inside the card, mirror into the owning list/table row when provided. */
    onLifecyclePatched?: (patch: Partial<Dispute>) => void;
};

function formatInitiatorName(dispute: Dispute) {
    const {name, surname} = dispute.initiator ?? {};
    const full = [name, surname].filter(Boolean).join(" ").trim();
    return full || "—";
}

function disputeRowTitle(dispute: Dispute): string {
    const r = dispute.reason?.trim();
    return r ? (r.length > 80 ? `${r.slice(0, 80)}…` : r) : dispute._id;
}

function DisputeCard({
    dispute: disputeProp,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
    onLifecyclePatched,
}: DisputeCardProps) {
    const [action, setAction] = useState("");
    const [dispute, setDispute] = useState<Dispute>(disputeProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);
    const {read, restore} = useAccess("disputes");

    useEffect(() => {
        setDispute(disputeProp);
    }, [disputeProp]);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(dispute, data);
        } else {
            setDispute({...dispute, ...(data as Partial<Dispute>)});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) onRestoreProp();
    };

    const applyLifecyclePatch = (patch: Partial<Dispute>) => {
        setDispute((prev) => ({...prev, ...patch}));
        onLifecyclePatched?.(patch);
    };

    if (hideAfterDeletion) return <></>;
    if (!restore && dispute.deletedAt != null) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const statusCfg = STATUS_CONFIG[dispute.status] ?? STATUS_CONFIG.closed;
    const title = disputeRowTitle(dispute);

    const initiatorName = formatInitiatorName(dispute);
    const initiatorInitials = [dispute.initiator?.name?.[0], dispute.initiator?.surname?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase();

    const orderTitle =
        dispute.order?.listing?.title ||
        dispute.order?.taskRequest?.title ||
        dispute.order?.name ||
        dispute.order?._id;

    const amountStr =
        dispute.order?.amount != null
            ? `${dispute.order.currency?.symbol?.trim() || dispute.order.currency?.abbreviation?.trim() || ""} ${dispute.order.amount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}`.trim()
            : null;

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
                        <DeletedInfo deletedAt={dispute.deletedAt} deletedBy={dispute.deletedBy} />
                    )}

                    <div className="p-3 flex flex-col gap-2">

                        {/* Title + action menu */}
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground min-h-[2.5rem] flex-1 min-w-0">
                                {dispute.reason}
                            </h3>
                            {!hideActions && (
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <ActionMenu
                                        accessModel="disputes"
                                        deletedData={dispute}
                                        onAction={(a: string) => setAction(a)}
                                        editPath=""
                                        hideEdit
                                        allowMenuForCustomChildren
                                    >
                                        <StartReviewDisputeDropdown dispute={dispute} onAction={(a: string) => setAction(a)} />
                                        <ResolveDisputeDropdown dispute={dispute} onAction={(a: string) => setAction(a)} />
                                        <CloseDisputeDropdown dispute={dispute} onAction={(a: string) => setAction(a)} />
                                    </ActionMenu>
                                </div>
                            )}
                        </div>

                        {/* Status indicator */}
                        <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide -mt-1", statusCfg.text)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusCfg.dot, statusCfg.dotAnim)} />
                            {resolveLanguageKey(`status_values.${dispute.status}`) ?? dispute.status}
                        </span>

                        {/* Initiator */}
                        {dispute.initiator && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 ring-1 ring-border">
                                    <span className="text-[8px] font-bold text-foreground leading-none">
                                        {initiatorInitials || "?"}
                                    </span>
                                </div>
                                <span className="truncate">{initiatorName}</span>
                            </div>
                        )}

                        <div className="h-px bg-border" />

                        {/* Footer: order reference + amount */}
                        <div className="flex items-end justify-between gap-2">
                            {orderTitle && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground min-w-0 truncate">
                                    <IconPackage className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{orderTitle}</span>
                                </span>
                            )}
                            {amountStr && (
                                <div className="shrink-0 text-right ml-auto">
                                    <div className="text-[9px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                                        {resolveLanguageKey("amount")}
                                    </div>
                                    <span className="font-bold text-base text-foreground leading-none">{amountStr}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {action === "view" && (
                <DisputeSheetView
                    open
                    onOpenChange={() => setAction("")}
                    dispute={dispute}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onListLifecyclePatched={(patch: Partial<Dispute>) => applyLifecyclePatch(patch)}
                />
            )}
            {(action === "startReview" || action === "resolve" || action === "close") && (
                <ChangeDisputeLifecycleAction
                    disputeId={dispute._id}
                    disputeTitle={title}
                    verb={action as DisputeLifecycleVerb}
                    openAlert
                    url={`/api/eCommerceMarketplace/dispute/${action}`}
                    onSuccess={(patch: Partial<Dispute>) => {
                        applyLifecyclePatch(patch);
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
            {action === "delete" && (
                <DeleteAction
                    accessModel="disputes"
                    deleteId={dispute._id}
                    openAlert
                    onSuccess={onDelete}
                    onCancel={() => setAction("")}
                    url="/api/eCommerceMarketplace/dispute"
                />
            )}
            {action === "restore" && (
                <RestoreAction
                    accessModel="disputes"
                    deleteId={dispute._id}
                    openAlert
                    onSuccess={onRestore}
                    onCancel={() => setAction("")}
                    url="/api/eCommerceMarketplace/dispute/restore"
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/disputes/center/cardView/disputeCard.tsx"),
    withDebug(true, true),
)(DisputeCard);
