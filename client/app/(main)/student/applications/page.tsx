"use client";

import { useEffect, useState } from "react";
import ApplicationCard, {
  ApplicationStatus,
  RewardType,
} from '@/components/features/applications/ApplicationCard';
import ListSkeleton from "@/components/ui/ListSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import {
  FiClock,
  FiPlay,
  FiCheckCircle,
  FiInbox,
  FiFileText,
} from "react-icons/fi";
import { submissionService } from "@/services/submission.service";
import Tabs from "@/components/ui/Tabs";

type Application = {
  id: number;
  title: string;
  tags: string[];
  companyName: string;
  companyId?: number;
  date: string;
  status: ApplicationStatus;
  rewardType?: RewardType;
};

const tabs = [
  { key: "Beklemede", label: "Beklemede", icon: FiClock },
  { key: "Devam Eden", label: "Devam Eden", icon: FiPlay },
  { key: "Tamamlanan", label: "Tamamlanan", icon: FiCheckCircle },
];

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState("Beklemede");
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const subs = await submissionService.getMySubmissions();
        const mapped: Application[] = subs.map((s: any) => ({
          id: s.id,
          title: s?.task?.title || "İsimsiz Görev",
          tags: s?.task?.requiredSkills?.map((sk: any) => sk.skill?.name).filter(Boolean) || [],
          companyName: s?.task?.company?.company_name || "Bilinmeyen Şirket",
          companyId: s?.task?.company_user_id || s?.task?.company?.user_id,
          date: s?.submitted_at ? new Date(s.submitted_at).toLocaleDateString("tr-TR") : "—",
          status: mapBackendStatus(s.status),
          rewardType: s?.task?.reward_type as RewardType,
        }));
        setApplications(mapped);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const mapBackendStatus = (status: string): ApplicationStatus => {
    switch (status?.toLowerCase()) {
      case "pending": return "Bekliyor";
      case "reviewing": return "İnceleniyor";
      case "approved":
      case "accepted": return "Kabul Edildi";
      case "rejected": return "Reddedildi";
      default: return "Bekliyor";
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (activeTab === "Beklemede") {
      return app.status === "Bekliyor" || app.status === "İnceleniyor";
    } else if (activeTab === "Devam Eden") {
      return app.status === "Kabul Edildi";
    } else if (activeTab === "Tamamlanan") {
      return app.status === "Reddedildi";
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-8">
        <ListSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-8">
      <div>
        <h1 className="text-[28px] font-extrabold tracking-[-0.01em] text-[#00342b] leading-tight">Başvurularım</h1>
        <p className="text-sm text-gray-500 mt-1.5 font-medium">
          Görev başvurularınızı takip edin ve yönetin
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Tabs 
          tabs={tabs.map(tab => {
            const count = applications.filter((app) => {
              if (tab.key === "Beklemede")
                return app.status === "Bekliyor" || app.status === "İnceleniyor";
              if (tab.key === "Devam Eden") return app.status === "Kabul Edildi";
              if (tab.key === "Tamamlanan") return app.status === "Reddedildi";
              return false;
            }).length;
            
            return {
              id: tab.key,
              label: `${tab.label} ${count > 0 ? `(${count})` : ''}`
            };
          })}
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                id={app.id}
                title={app.title}
                tags={app.tags}
                companyName={app.companyName}
                companyId={app.companyId}
                date={app.date}
                status={app.status}
                rewardType={app.rewardType}
              />
            ))}
          </div>
        ) : (
          <div className="bg-transparent rounded-2xl p-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[300px]">
            <EmptyState icon={FiInbox} title="Başvuru Bulunmuyor" message="Bu kategoride henüz bir başvurunuz bulunmamaktadır." />
          </div>
        )}
      </div>
    </div>
  );
}
