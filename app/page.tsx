import { SearchForm } from '@/components/search/SearchForm';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          Find Your Perfect Flight
        </h1>
        <p className="text-xl text-gray-600">
          Compare prices from multiple airlines and book with confidence
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto">
        <SearchForm />
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon="✈️"
          title="Best Prices"
          description="We search across GDS, NDC, and aggregators to find you the best deals"
        />
        <FeatureCard
          icon="🚀"
          title="Fast & Reliable"
          description="Cached results and optimized APIs for lightning-fast searches"
        />
        <FeatureCard
          icon="🔒"
          title="Secure Booking"
          description="Your data is protected with industry-standard encryption"
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
