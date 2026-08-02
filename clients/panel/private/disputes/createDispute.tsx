import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createDisputeFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/dispute/createDispute.form.validator.ts";
import type {CreateDisputeFormType} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/dispute/dispute.schema-def.ts";

export default createGenericCreatePage<CreateDisputeFormType>({
    languagePath: "src/modules/eCommerceMarketplace/clients/panel/private/disputes/createDispute.tsx",
    collectionName: "disputes",
    accessModel: "disputes",
    apiUrl: "/api/eCommerceMarketplace/dispute",
    schema: createDisputeFormSchema,
    defaultValues: (params) => ({
        orderId: params.get("orderId") ?? "",
        reason: "",
    }),
    successPath: "/eCommerceMarketplace/disputes",
});
