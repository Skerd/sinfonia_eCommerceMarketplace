import { compose } from "redux";
import { useEffect, useState } from "react";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import { useAccess } from "@coreModule/helpers/hocs/withAccess.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import { Card } from "@coreModule/components/ui/card.tsx";
import { cn } from "@coreModule/components/lib/utils.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import { IconStar, IconCode } from "@tabler/icons-react";
import type { ProviderProfile } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerProfile/providerProfile.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import ProviderProfileSheetView from "@eCommerceMarketplaceModule/clients/panel/private/providerProfile/center/sheetView/providerProfileSheetView.tsx";
import CreateAccountLinkDropdown from "@eCommerceMarketplaceModule/clients/panel/private/providerProfile/center/actions/createAccountLinkDropdown.tsx";
import RefreshAccountStatusDropdown from "@eCommerceMarketplaceModule/clients/panel/private/providerProfile/center/actions/refreshAccountStatusDropdown.tsx";
import ConnectAccountAction, {
    type ConnectActionKey,
} from "@eCommerceMarketplaceModule/components/custom/providerProfile/connectAccountAction.tsx";

type ProviderProfileCardProps = WithLanguageType & {
    profile: ProviderProfile;
    onDelete?: (deleted?: ProviderProfile, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function profileDisplayName(profile: ProviderProfile) {
    return [profile.user?.name, profile.user?.surname].filter(Boolean).join(" ") || undefined;
}

function ProviderProfileCard({
    profile: profileProp,
    resolveLanguageKey,
    hideActions = false,
    sheetOnly = false,
}: ProviderProfileCardProps) {
    const [action, setAction] = useState("");
    const [profile, setProfile] = useState<ProviderProfile>(profileProp);
    const { read } = useAccess("providerProfiles");

    useEffect(() => { setProfile(profileProp); }, [profileProp]);

    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const userName = profileDisplayName(profile) || "—";
    const initials = [profile.user?.name?.[0], profile.user?.surname?.[0]].filter(Boolean).join("").toUpperCase();

    const editPath = (() => {
        if (!profile._id) return "";
        const params = new URLSearchParams();
        params.set("profileId", profile._id);
        const name = profile.user?.name;
        if (name) params.set("profileName", name);
        return `/eCommerceMarketplace/providerprofile/edit?${params.toString()}`;
    })();

    const connectStatusLabel = profile.stripePayoutsEnabled
        ? resolveLanguageKey("connect.payoutsEnabled")
        : profile.stripeAccountId
          ? resolveLanguageKey("connect.setupIncomplete")
          : resolveLanguageKey("connect.notConnected");

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
                    <div className="h-1 w-full bg-primary/60" />

                    <div className="p-3 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-bold text-primary leading-none">{initials || "?"}</span>
                                </div>
                                <h3 className="font-semibold text-sm leading-snug truncate text-foreground">
                                    {userName}
                                </h3>
                            </div>
                            {!hideActions && (
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <ActionMenu
                                        accessModel="providerProfiles"
                                        deletedData={profile as any}
                                        onAction={(a: string) => setAction(a)}
                                        editPath={editPath}
                                        allowMenuForCustomChildren
                                    >
                                        <CreateAccountLinkDropdown profile={profile} onAction={(a: string) => setAction(a)} />
                                        <RefreshAccountStatusDropdown profile={profile} onAction={(a: string) => setAction(a)} />
                                    </ActionMenu>
                                </div>
                            )}
                        </div>

                        {profile.bio && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-normal">{profile.bio}</p>
                        )}

                        <div className="h-px bg-border" />

                        <div className="flex items-center justify-between gap-2">
                            {profile.skills && profile.skills.length > 0 ? (
                                <div className="flex items-center gap-1 min-w-0 truncate">
                                    <IconCode className="w-3 h-3 shrink-0 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground truncate">
                                        {profile.skills.slice(0, 3).join(", ")}
                                        {profile.skills.length > 3 && ` +${profile.skills.length - 3}`}
                                    </span>
                                </div>
                            ) : <span />}

                            {profile.averageRating != null && (
                                <span className="flex items-center gap-1 shrink-0 text-xs font-semibold text-amber-600">
                                    <IconStar className="w-3 h-3" />
                                    {profile.averageRating.toFixed(1)}
                                    {profile.reviewCount != null && (
                                        <span className="font-normal text-muted-foreground">({profile.reviewCount})</span>
                                    )}
                                </span>
                            )}
                        </div>

                        <span
                            className={cn(
                                "inline-flex w-fit items-center text-[10px] font-semibold uppercase tracking-wide",
                                profile.stripePayoutsEnabled
                                    ? "text-emerald-600"
                                    : profile.stripeAccountId
                                      ? "text-amber-600"
                                      : "text-muted-foreground",
                            )}
                        >
                            {connectStatusLabel}
                        </span>
                    </div>
                </Card>
            )}

            {action === "view" && (
                <ProviderProfileSheetView
                    open
                    onOpenChange={() => setAction("")}
                    profile={profile}
                    fetchId={profile._id}
                    onSheetRowPatched={(patch) => setProfile({ ...profile, ...patch })}
                />
            )}
            {(action === "createAccountLink" || action === "refreshAccountStatus") && (
                <ConnectAccountAction
                    actionKey={action as ConnectActionKey}
                    displayName={userName === "—" ? undefined : userName}
                    openAlert
                    url={`/api/eCommerceMarketplace/providerProfile/${action}`}
                    onSuccess={(result) => {
                        setProfile({
                            ...profile,
                            ...(result.stripeAccountId ? {stripeAccountId: result.stripeAccountId} : {}),
                            ...(result.chargesEnabled !== undefined ? {stripeChargesEnabled: result.chargesEnabled} : {}),
                            ...(result.payoutsEnabled !== undefined ? {stripePayoutsEnabled: result.payoutsEnabled} : {}),
                            ...(result.detailsSubmitted !== undefined ? {stripeDetailsSubmitted: result.detailsSubmitted} : {}),
                            stripeAccountSyncedAt: new Date().toISOString(),
                        });
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/providerProfile/center/cardView/providerProfileCard.tsx"),
    withDebug(true, true),
)(ProviderProfileCard);
