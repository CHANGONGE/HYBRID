import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { getKPI, getExpenses } from "@/lib/notion";
import { KPICard } from "@/components/dashboard/KPICard";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? undefined;
  const admin = isAdmin(email);

  const kpi = await getKPI(admin ? undefined : email).catch(() => ({
    thisMonthTotal: 0, totalCount: 0, usedAmount: 0,
    limitExceeded: 0, unprocessed: 0,
  }));

  const recent = await getExpenses(admin ? undefined : email)
    .then((r) => r.slice(0, 5))
    .catch(() => []);

  const fmt = (n: number) => {
    const man = n / 10_000;
    return man >= 1
      ? `${man % 1 === 0 ? man.toFixed(0) : man.toFixed(1)}만원`
      : `${n.toLocaleString()}원`;
  };

  return (
    <div className="px-4 pt-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            안녕하세요 👋
          </p>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {session?.user?.name?.split(" ")[0]}님
            {admin && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                관리자
              </span>
            )}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          {session?.user?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="프로필" className="w-full h-full object-cover" />
          )}
        </div>
      </div>

      {/* KPI 카드 그리드 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <KPICard
          title="이번달 지출"
          value={fmt(kpi.thisMonthTotal)}
          gradient="kpi-blue"
          icon="💰"
        />
        <KPICard
          title="총 건수"
          value={`${kpi.totalCount}건`}
          gradient="kpi-green"
          icon="📄"
        />
        <KPICard
          title="누적 사용금액"
          value={fmt(kpi.usedAmount)}
          gradient="kpi-purple"
          icon="💳"
        />
        <KPICard
          title="한도 초과"
          value={`${kpi.limitExceeded}건`}
          gradient={kpi.limitExceeded > 0 ? "kpi-red" : "kpi-green"}
          icon={kpi.limitExceeded > 0 ? "⚠️" : "✅"}
          alert={kpi.limitExceeded > 0}
        />
        <div className="col-span-2">
          <KPICard
            title="미처리 (이미지 미첨부)"
            value={`${kpi.unprocessed}건`}
            gradient={kpi.unprocessed > 0 ? "kpi-orange" : "kpi-green"}
            icon={kpi.unprocessed > 0 ? "📎" : "✅"}
            alert={kpi.unprocessed > 0}
          />
        </div>
      </div>

      {/* 최근 경비 */}
      <DashboardClient recent={recent} isAdmin={admin} />
    </div>
  );
}
