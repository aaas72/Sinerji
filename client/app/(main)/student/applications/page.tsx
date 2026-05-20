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

      <div className="rounded-2xl overflow-hidden">
        <div className="flex border-b border-[#f1f0ea] px-4 select-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = applications.filter((app) => {
              if (tab.key === "Beklemede")
                return app.status === "Bekliyor" || app.status === "İnceleniyor";
              if (tab.key === "Devam Eden") return app.status === "Kabul Edildi";
              if (tab.key === "Tamamlanan") return app.status === "Reddedildi";
              return false;
            }).length;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-bold transition-all relative uppercase tracking-wider cursor-pointer ${isActive
                  ? "text-[#004d40]"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {count > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition-all ${isActive
                      ? "bg-[#004d40]/15 border-[#004d40]/30 text-[#004d40]"
                      : "bg-transparent border-gray-200 text-gray-400"
                      }`}
                  >
                    {count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#004d40] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-8">
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
        </div>
      </div>
    </div>
  );
}
