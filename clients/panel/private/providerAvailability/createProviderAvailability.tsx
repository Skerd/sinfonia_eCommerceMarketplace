import { IconPlus } from "@tabler/icons-react";
import { createGenericCreatePage } from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import { createProviderAvailabilityFormSchema } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerAvailability/createProviderAvailability.form.validator.ts";
import type { CreateProviderAvailabilityFormType } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerAvailability/providerAvailability.schema-def.ts";

export default createGenericCreatePage<CreateProviderAvailabilityFormType>({
    languagePath: "src/modules/eCommerceMarketplace/clients/panel/private/providerAvailability/createProviderAvailability.tsx",
    collectionName: "provideravailabilities",
    accessModel: "providerAvailabilities",
    apiUrl: "/api/eCommerceMarketplace/providerAvailability",
    schema: createProviderAvailabilityFormSchema,
    defaultValues: { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", timezone: "UTC" },
    submitIcon: <IconPlus />,
});
