export type Community = {
    id: string;
    name: string;
    slug: string;
    plan: 'starter_100' | 'growth_250' | 'pro_500';
    features: {
        marketplace: boolean;
        resources: boolean;
        events: boolean;
        documents: boolean;
        forum: boolean;
        messages: boolean;
        services: boolean; // service pros
        local: boolean; // local guide
    };
    isActive: boolean;
    branding: {
        logoUrl: string;
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
    };
};
