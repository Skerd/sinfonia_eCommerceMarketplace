import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createPromotionFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/promotion/createPromotion.form.validator.ts";
import type {CreatePromotionFormType} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/promotion/promotion.schema-def.ts";

export default createGenericCreatePage<CreatePromotionFormType>({
    languagePath: "src/modules/eCommerceMarketplace/clients/panel/private/promotions/createPromotion.tsx",
    collectionName: "promotions",
    accessModel: "promotions",
    apiUrl: "/api/eCommerceMarketplace/promotion",
    schema: createPromotionFormSchema,
    defaultValues: {listing: "", type: "featured", startAt: "", endAt: ""},
    submitIcon: <IconPlus />,
    successPath: "/eCommerceMarketplace/promotions",
});
