import { OrganizationProfile } from '@clerk/nextjs';

export default function TeamSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900">Team Settings</h1>
      <OrganizationProfile
        appearance={{
          elements: {
            rootBox: 'w-full max-w-3xl',
            card: 'shadow-none border border-neutral-200',
          },
        }}
      />
    </div>
  );
}
