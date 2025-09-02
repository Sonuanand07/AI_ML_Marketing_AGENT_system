import { Lead, Campaign, CustomerProfile } from '../types';

export class DataExtractor {
  /**
   * Extract and process data from the uploaded marketing dataset
   */
  public static async extractMarketingData(zipData: ArrayBuffer): Promise<{
    leads: Lead[];
    campaigns: Campaign[];
    customers: CustomerProfile[];
  }> {
    try {
      // In a real implementation, this would parse the ZIP file
      // For now, we'll generate realistic sample data based on the assessment requirements
      
      const leads = this.generateSampleLeads();
      const campaigns = this.generateSampleCampaigns();
      const customers = this.generateSampleCustomers();

      return { leads, campaigns, customers };
    } catch (error) {
      console.error('Failed to extract marketing data:', error);
      throw new Error('Data extraction failed');
    }
  }

  private static generateSampleLeads(): Lead[] {
    const sources = ['website_form', 'referral', 'social_media', 'cold_outreach', 'event'];
    const companies = [
      'TechCorp Inc.', 'Startup.io', 'Enterprise Corp', 'Innovate Solutions',
      'Digital Dynamics', 'Future Systems', 'Smart Analytics', 'Cloud Ventures'
    ];
    const names = [
      'John Doe', 'Sarah Smith', 'Mike Johnson', 'Emily Davis', 'Alex Wilson',
      'Jessica Brown', 'David Lee', 'Amanda Taylor', 'Chris Anderson', 'Lisa Garcia'
    ];

    return Array.from({ length: 50 }, (_, i) => {
      const name = names[Math.floor(Math.random() * names.length)];
      const company = Math.random() > 0.3 ? companies[Math.floor(Math.random() * companies.length)] : undefined;
      const source = sources[Math.floor(Math.random() * sources.length)];
      const score = Math.floor(Math.random() * 100);
      
      return {
        id: `lead_${Date.now()}_${i}`,
        email: `${name.toLowerCase().replace(' ', '.')}@${company?.toLowerCase().replace(/[^a-z]/g, '') || 'email'}.com`,
        name,
        company,
        source,
        category: this.determineLeadCategory(score),
        score,
        status: 'new' as any,
        metadata: {
          processingTimestamp: new Date(),
          triageAgent: 'triage_agent',
          interest: this.getRandomInterest()
        },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      };
    });
  }

  private static generateSampleCampaigns(): Campaign[] {
    const campaignTypes = ['email', 'social_media', 'content_marketing', 'paid_ads', 'webinar'];
    const campaignNames = [
      'Q4 Growth Initiative', 'Product Launch Campaign', 'Customer Retention Drive',
      'Lead Nurturing Series', 'Brand Awareness Campaign', 'Conversion Optimization'
    ];

    return Array.from({ length: 15 }, (_, i) => {
      const type = campaignTypes[Math.floor(Math.random() * campaignTypes.length)] as any;
      const name = campaignNames[Math.floor(Math.random() * campaignNames.length)];
      const sent = Math.floor(Math.random() * 5000) + 500;
      const delivered = Math.floor(sent * (0.9 + Math.random() * 0.1));
      const opened = Math.floor(delivered * (0.15 + Math.random() * 0.25));
      const clicked = Math.floor(opened * (0.02 + Math.random() * 0.08));
      const converted = Math.floor(clicked * (0.1 + Math.random() * 0.2));

      return {
        id: `campaign_${Date.now()}_${i}`,
        name: `${name} ${i + 1}`,
        type,
        status: this.getRandomCampaignStatus(),
        targetAudience: this.getRandomAudience(),
        content: {
          body: this.getRandomCampaignContent(type),
          callToAction: this.getRandomCTA(),
          personalizationTokens: ['name', 'company', 'industry']
        },
        metrics: {
          sent,
          delivered,
          opened,
          clicked,
          converted,
          bounced: sent - delivered,
          unsubscribed: Math.floor(opened * 0.01),
          revenue: converted * (Math.random() * 5000 + 1000)
        },
        startDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        endDate: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
        budget: Math.floor(Math.random() * 20000) + 5000,
        createdBy: 'engagement_agent'
      };
    });
  }

  private static generateSampleCustomers(): CustomerProfile[] {
    const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing'];
    const preferences = {
      communicationChannels: [['email'], ['email', 'phone'], ['email', 'social_media']],
      contentTypes: [['articles'], ['videos'], ['webinars'], ['case_studies']],
      frequencies: ['daily', 'weekly', 'monthly'],
      topics: [
        ['AI/ML', 'automation'], 
        ['marketing', 'sales'], 
        ['analytics', 'data'], 
        ['technology', 'innovation']
      ]
    };

    return Array.from({ length: 30 }, (_, i) => {
      const name = `Customer ${i + 1}`;
      const company = `Company ${i + 1}`;
      const industry = industries[Math.floor(Math.random() * industries.length)];
      
      return {
        id: `customer_${Date.now()}_${i}`,
        email: `customer${i + 1}@company${i + 1}.com`,
        name,
        company,
        industry,
        preferences: {
          communicationChannel: preferences.communicationChannels[Math.floor(Math.random() * preferences.communicationChannels.length)],
          contentTypes: preferences.contentTypes[Math.floor(Math.random() * preferences.contentTypes.length)],
          frequency: preferences.frequencies[Math.floor(Math.random() * preferences.frequencies.length)],
          topics: preferences.topics[Math.floor(Math.random() * preferences.topics.length)],
          timezone: 'UTC'
        },
        interactionHistory: [],
        segmentTags: [industry.toLowerCase(), 'active'],
        lifetimeValue: Math.floor(Math.random() * 50000) + 5000,
        lastEngagement: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      };
    });
  }

  private static determineLeadCategory(score: number): any {
    if (score >= 80) return 'hot_prospect';
    if (score >= 60) return 'campaign_qualified';
    if (score >= 40) return 'general_inquiry';
    return 'cold_lead';
  }

  private static getRandomInterest(): string {
    const interests = [
      'AI/ML solutions', 'marketing automation', 'data analytics', 
      'customer engagement', 'lead generation', 'conversion optimization'
    ];
    return interests[Math.floor(Math.random() * interests.length)];
  }

  private static getRandomCampaignStatus(): any {
    const statuses = ['draft', 'active', 'paused', 'completed'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private static getRandomAudience(): string[] {
    const audiences = [
      'tech_companies', 'startups', 'enterprise', 'small_business',
      'marketing_managers', 'sales_teams', 'executives', 'developers'
    ];
    const count = Math.floor(Math.random() * 3) + 1;
    return Array.from({ length: count }, () => 
      audiences[Math.floor(Math.random() * audiences.length)]
    ).filter((value, index, self) => self.indexOf(value) === index);
  }

  private static getRandomCampaignContent(type: string): string {
    const contentMap: Record<string, string[]> = {
      email: [
        'Discover how our AI solutions can transform your business operations.',
        'Join thousands of companies already using our platform.',
        'Get personalized insights to boost your marketing ROI.'
      ],
      social_media: [
        'Engage with our community and share your success stories.',
        'Follow us for the latest industry insights and tips.',
        'Connect with like-minded professionals in our network.'
      ],
      content_marketing: [
        'Download our comprehensive guide to marketing automation.',
        'Read our latest research on customer engagement trends.',
        'Access exclusive content from industry experts.'
      ],
      paid_ads: [
        'Click to learn more about our premium solutions.',
        'Limited time offer - get started with a free trial.',
        'See how we can help you achieve your business goals.'
      ],
      webinar: [
        'Join our live webinar on marketing best practices.',
        'Register for an exclusive session with industry leaders.',
        'Learn from real-world case studies and success stories.'
      ]
    };

    const contents = contentMap[type] || contentMap.email;
    return contents[Math.floor(Math.random() * contents.length)];
  }

  private static getRandomCTA(): string {
    const ctas = [
      'Schedule a demo', 'Download whitepaper', 'Start free trial',
      'Contact sales', 'Learn more', 'Register now', 'Get started'
    ];
    return ctas[Math.floor(Math.random() * ctas.length)];
  }
}