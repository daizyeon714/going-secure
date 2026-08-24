"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getScenarioById, getNode } from "@/lib/data/scenarios";
import { AnalysisResult, DecisionChoice, NodeRecord, ScenarioNode } from "@/lib/types";
import { recordCompletion, saveDraft, loadDraft, clearDraft } from "@/lib/storage";
import { analyzeChoice, analyzeFreeText } from "@/lib/getAnalysis";
import ScenarioArt from "@/components/ScenarioArt";
import CategoryBadge from "@/components/CategoryBadge";
import StepIndicator from "@/components/StepIndicator";
import ChoiceButton from "@/components/ChoiceButton";
import FreeTextInput from "@/components/FreeTextInput";
import AnalysisPanel from "@/components/AnalysisPanel";

export default function ScenarioPlayPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const scenario = getScenarioById(params.id);

  const [currentNodeId, setCurrentNodeId] = useState<string>(scenario?.startNodeId ?? "");
  const [records, setRecords] = useState<NodeRecord[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<DecisionChoice | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [pendingUserText, setPendingUserText] = useState<string>("");

  // 새로고침 시 이어하기 (sessionStorage draft)
  useEffect(() => {
    if (!scenario) return;
    const draft = loadDraft(scenario.id);
    if (draft && getNode(scenario, draft.currentNodeId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecords(draft.records);
      setCurrentNodeId(draft.currentNodeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario?.id]);

  if (!scenario || !scenario.implemented) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-6 py-20 text-center">
        <p className="font-serif text-xl font-semibold text-ink">아직 준비 중인 상황이에요</p>
        <p className="mt-2 text-sm text-ink-soft">
          이 시나리오는 곧 만나볼 수 있어요. 지금은 다른 상황부터 대비해볼까요?
        </p>
        <Link
          href="/scenarios"
          className="inline-block mt-6 rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-cream"
        >
          다른 상황 둘러보기
        </Link>
      </div>
    );
  }

  const node = getNode(scenario, currentNodeId);
  if (!node) return null;

  const isLastNode = node.next === null && (!selectedChoice || selectedChoice.next === null);

  async function handleChoice(choice: DecisionChoice) {
    if (revealed || loading) return;
    setSelectedChoice(choice);
    setRevealed(true);
    setLoading(true);
    const result = await analyzeChoice(scenario!.id, node!, choice);
    setAnalysis(result);
    setLoading(false);
  }

  async function handleFreeText(text: string) {
    if (revealed || loading) return;
    setRevealed(true);
    setLoading(true);
    const result = await analyzeFreeText(scenario!.id, node!, text);
    setAnalysis(result);
    // freeText는 사용자 입력 자체를 기록에 담아둔다
    setPendingUserText(text);
    setLoading(false);
  }

  function buildRecord(n: ScenarioNode, a: AnalysisResult): NodeRecord {
    if (n.inputType === "choice" && selectedChoice) {
      return {
        nodeId: n.id,
        order: n.order,
        inputType: "choice",
        choiceId: selectedChoice.id,
        choiceLabel: selectedChoice.label,
        goodJudgments: a.goodJudgments,
        riskyJudgments: a.riskyJudgments,
        lean: a.lean,
      };
    }
    return {
      nodeId: n.id,
      order: n.order,
      inputType: "freeText",
      userText: pendingUserText,
      goodJudgments: a.goodJudgments,
      riskyJudgments: a.riskyJudgments,
      lean: a.lean,
    };
  }

  function handleNext() {
    if (!analysis) return;
    const record = buildRecord(node!, analysis);
    const nextRecords = [...records, record];

    // 분기 결정: choice.next가 있으면 우선, 없으면 node.next
    const nextNodeId =
      node!.inputType === "choice" && selectedChoice?.next !== undefined
        ? selectedChoice.next
        : node!.next;

    // 상태 초기화
    setRecords(nextRecords);
    setSelectedChoice(null);
    setAnalysis(null);
    setRevealed(false);
    setPendingUserText("");

    if (!nextNodeId) {
      recordCompletion(scenario!.id, nextRecords);
      clearDraft(scenario!.id);
      router.push(`/result/${scenario!.id}`);
    } else {
      saveDraft(scenario!.id, { currentNodeId: nextNodeId, records: nextRecords });
      setCurrentNodeId(nextNodeId);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-8 sm:py-12 pb-24">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/scenarios" className="text-sm text-ink-faint hover:text-ink-soft">
          ← 다른 상황
        </Link>
      </div>

      <div className="mb-5 flex items-center gap-2.5">
        <CategoryBadge category={scenario.category} />
        <h1 className="font-serif text-lg font-semibold text-ink">{scenario.title}</h1>
      </div>

      <div className="mb-6">
        <StepIndicator current={node.order} total={scenario.totalSteps} />
        <p className="mt-2 text-xs text-ink-faint">
          {node.order} / {scenario.totalSteps} 번째 판단
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden border border-line mb-6 aspect-[16/10]">
        <ScenarioArt artKey={scenario.thumbnail} category={scenario.category} seed={scenario.id} alt={node.imageAlt} className="h-full w-full object-cover" />
      </div>

      <div key={node.id} className="animate-fade-in">
        <p className="text-[17px] sm:text-lg leading-relaxed text-ink mb-7">{node.situation}</p>

        {/* 입력 영역: 객관식 vs 자유응답 */}
        {node.inputType === "choice" ? (
          <div className="space-y-3 mb-6">
            {node.choices?.map((choice) => (
              <ChoiceButton
                key={choice.id}
                choice={choice}
                onSelect={handleChoice}
                disabled={revealed}
                selected={selectedChoice?.id === choice.id}
                revealed={revealed}
              />
            ))}
          </div>
        ) : (
          !revealed && (
            <div className="mb-6">
              <FreeTextInput
                prompt={node.prompt ?? "너라면 어떻게 할 것 같아?"}
                placeholder={node.placeholder}
                onSubmit={handleFreeText}
                disabled={revealed}
              />
            </div>
          )
        )}

        {/* 분석 결과 */}
        {revealed && (
          <div className="space-y-6">
            {loading ? (
              <div className="rounded-2xl border border-line-soft bg-cream-soft p-5 text-sm text-ink-faint animate-fade-in">
                {node.inputType === "freeText"
                  ? "네 판단을 검증된 기준과 비교하고 있어…"
                  : "판단을 확인하고 있어…"}
              </div>
            ) : (
              analysis && (
                <AnalysisPanel
                  result={analysis}
                  reactionText={
                    node.inputType === "choice" ? selectedChoice?.reaction : undefined
                  }
                  sourceName={scenario.sourceName}
                  sourceUrl={scenario.sourceUrl}
                />
              )
            )}

            {!loading && (
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto rounded-full bg-brand px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-brand-strong"
              >
                {isLastNode ? "판단 마무리하기" : "다음 상황으로"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
