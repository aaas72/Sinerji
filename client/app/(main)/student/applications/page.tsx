"use client";

import { useEffect, useState } from "react";
import ApplicationCard, {
  ApplicationStatus,
  RewardType,
} from "@/components/ui/cards/ApplicationCard";
import {
  FiClock,
  FiPlay,
  FiCheckCircle,
  FiInbox,
  FiFileText,
} from "react-icons/fi";
import { submissionService } from "@/services/submission.service";
import Tabs from "@/components/ui/Tabs";
import SectionCard from "@/components/ui/cards/SectionCard";

type Application = {
  id: number;
  title: string;
  tags: string[];
  companyName: string;
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#004d40] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900 leading-tight font-heading">Başvurularım</h1>
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

        <SectionCard 
          icon={tabs.find(t => t.key === activeTab)?.icon || FiInbox} 
          title={`${activeTab} Başvurular`}
          className="bg-white border-[#f1f0ea] shadow-2xs"
        >
          {filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  title={app.title}
                  tags={app.tags}
                  companyName={app.companyName}
                  date={app.date}
                  status={app.status}
                  rewardType={app.rewardType}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-transparent">
              <div className="w-16 h-16 bg-transparent border border-[#f1f0ea] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <FiInbox className="w-6 h-6" />
              </div>
              <p className="text-gray-400 text-sm font-semibold">
                Bu kategoride başvuru bulunmamaktadır.
              </p>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
