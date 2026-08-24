import { Scenario } from "../types";

// verifiedPrinciple / reason / evaluationCriteria / verifiedPrinciples 는 모두
// 대한민국 공식 기관(소방청 국민재난안전포털, 질병관리청 국가건강정보포털 등) 자료를 기준으로
// 사람이 사전에 검증하여 고정한 내용이다.
// AI는 이 내용을 변경하거나 새로운 안전수칙을 생성하지 않으며, 이 범위 안에서만 해석/설명한다.
//
// 각 시나리오는 단순 문제 배열이 아니라 decision tree(노드 그래프)다.
// choice의 next로 분기가 발생하며, 사용자의 판단이 다음 상황(노드)을 바꾼다.

export const scenarios: Scenario[] = [
  // ─────────────────────────────────────────────
  // EP.01 — 자취방 화재 (연속 판단 훈련 · 자유응답 2 + 객관식 3, 분기 포함)
  // ─────────────────────────────────────────────
  {
    id: "studio-fire",
    title: "EP.01 · 새벽 2시, 자취방에 불이 났다",
    situationTitle: "새벽 2시, 문밖에서 타는 냄새가 난다",
    category: "urban",
    description: "잠결에 맡은 탄내. 지금부터의 판단이, 다음 상황을 바꾼다.",
    thumbnail: "studio-fire",
    estimatedTime: "6분",
    sourceName: "소방청 국민재난안전포털 · 화재 발생 시 행동요령",
    sourceUrl:
      "https://www.safekorea.go.kr/idsiSFK/neo/sfk/cs/contents/prevent/SDIJKM5116.html",
    status: "not-started",
    implemented: true,
    startNodeId: "fire-1",
    totalSteps: 5,
    verifiedPrinciples: [
      "문을 열기 전, 대피 경로의 안전성(손잡이·문틈의 열기와 연기)을 먼저 확인한다.",
      "연기 속에서는 자세를 낮추고 젖은 천으로 코와 입을 막으며, 엘리베이터 대신 계단을 이용한다.",
      "대피로가 연기로 막히면 무리하게 이동하지 말고, 문틈을 막아 연기를 차단한 뒤 창가에서 구조를 요청한다.",
      "119 신고 시에는 정확한 위치(동·호수·층)와 현재 상황을 구체적으로 전달한다.",
    ],
    nodes: [
      // ── 판단 1 (자유응답) ──
      {
        id: "fire-1",
        order: 1,
        situation:
          "새벽 2시. 탄 냄새에 잠이 깼다. 방문 밖 복도 쪽에서 냄새가 들어오고, 사람들의 웅성거리는 목소리도 희미하게 들린다. 아직 방 안에 연기는 보이지 않는다.",
        prompt: "너라면 지금 가장 먼저 어떻게 할 것 같아?",
        placeholder: "나라면…",
        imageAlt:
          "어두운 방, 문 아래 틈으로 희미한 빛과 냄새가 스며드는 새벽의 순간을 그린 차분한 에디토리얼 일러스트",
        imageMood: "calm",
        inputType: "freeText",
        evaluationCriteria: [
          {
            action: "119 신고를 떠올리거나 시도함",
            verdict: "good",
            note: "화재 인지 시 신고를 함께 고려하는 것은 적절한 판단이다.",
          },
          {
            action: "문 상황(열기·연기)을 확인하지 않고 바로 문을 열려고 함",
            verdict: "risky",
            note: "문 너머에 불이 있으면 문을 여는 순간 산소가 공급되며 화염·연기가 급격히 커질 수 있다.",
          },
          {
            action: "손잡이·문틈으로 열기와 연기를 먼저 확인하려 함",
            verdict: "good",
            note: "문을 열기 전 온도를 확인하는 것은 소방청이 안내하는 기본 원칙이다.",
          },
          {
            action: "자세를 낮추거나 대피를 준비함",
            verdict: "good",
            note: "연기는 위쪽부터 차오르므로 낮은 자세를 유지하는 것이 안전하다.",
          },
          {
            action: "확인·신고 없이 무작정 기다림",
            verdict: "risky",
            note: "상황 파악과 신고 없이 대기하면 대피 골든타임을 놓칠 수 있다.",
          },
        ],
        fallbackFreeText:
          "지금은 네 문장을 AI가 자세히 해석하기 어려운 상태야. 대신 이 상황에서 검증된 판단 포인트를 함께 짚어볼게.",
        verifiedPrinciple:
          "화재가 의심되면 신고를 함께 고려하되, 문을 열기 전 반드시 문의 상태(열기·연기)부터 확인해 대피 경로가 안전한지 판단한다.",
        next: "fire-2",
      },

      // ── 판단 2 (객관식, 분기 지점) ──
      {
        id: "fire-2",
        order: 2,
        situation:
          "정신을 차리고 현관 쪽으로 다가갔다. 문을 열어 밖을 확인하고 싶은 마음이 든다. 문을 어떻게 다룰까?",
        imageAlt: "현관문 앞에 서서 손잡이로 손을 뻗는 사람의 뒷모습을 담은 차분한 톤의 일러스트",
        imageMood: "tense",
        inputType: "choice",
        choices: [
          {
            id: "fire-2-check",
            label: "손등으로 손잡이와 문틈을 먼저 짚어 열기를 확인한다",
            evaluation: "recommended",
            reaction: "좋아. 이 상황에서는 먼저 확인하는 판단이 맞아.",
            reason:
              "손잡이나 문틈이 뜨겁다면 문 너머에 화염이 있다는 신호다. 문을 열기 전 온도를 확인하는 것이 기본 원칙이다.",
            next: "fire-3-safe",
          },
          {
            id: "fire-2-open",
            label: "밖이 궁금하니 일단 문을 열어 상황을 본다",
            evaluation: "risky",
            reaction: "이 선택은 실제 상황에선 위험할 수 있어.",
            reason:
              "문 반대편에 불이 있으면 문을 여는 순간 산소가 공급되며 화염이 급격히 커진다. 확인 없이 여는 것은 위험하다.",
            next: "fire-3-danger",
          },
          {
            id: "fire-2-listen",
            label: "문에 귀를 대고 바깥 소리만 들어본다",
            evaluation: "caution",
            reaction: "여기서 많이들 헷갈려.",
            reason:
              "소리를 듣는 것만으로는 문 너머의 열기와 연기를 알기 어렵다. 손등으로 온도를 함께 확인해야 판단이 정확해진다.",
            next: "fire-3-safe",
          },
        ],
        verifiedPrinciple:
          "문을 열기 전에는 손등으로 손잡이와 문틈을 짚어 온도를 확인한다. 뜨겁다면 문 너머에 불이 있다는 뜻이므로 열지 않는다.",
        next: "fire-3-safe",
      },

      // ── 판단 3-A (안전 경로 분기) ──
      {
        id: "fire-3-safe",
        order: 3,
        situation:
          "손잡이는 뜨겁지 않았다. 문을 조금 열어 확인하니 복도에 연기가 낮게 깔려 있다. 아직 이동은 가능해 보인다. 어떻게 이동할까?",
        imageAlt: "복도에 낮게 깔린 연기 사이로 몸을 낮춰 이동하려는 사람의 실루엣을 그린 차분한 일러스트",
        imageMood: "tense",
        inputType: "choice",
        choices: [
          {
            id: "fire-3s-low",
            label: "자세를 낮추고 젖은 천으로 코와 입을 막은 뒤 계단으로 이동한다",
            evaluation: "recommended",
            reaction: "좋아. 지금 판단은 방향이 맞아.",
            reason:
              "연기 속에서는 바닥 쪽 공기가 상대적으로 깨끗하다. 자세를 낮추고 호흡기를 보호하면 유독가스 흡입을 줄일 수 있고, 화재 시엔 계단을 이용해야 한다.",
            next: "fire-4",
          },
          {
            id: "fire-3s-run",
            label: "선 채로 빠르게 뛰어서 대피한다",
            evaluation: "risky",
            reaction: "이 선택은 실제 상황에선 위험할 수 있어.",
            reason:
              "연기는 위쪽에 먼저 차오른다. 서서 이동하면 유독가스를 더 많이 들이마시게 되어 위험하다.",
            next: "fire-4",
          },
          {
            id: "fire-3s-elev",
            label: "가장 빠른 엘리베이터로 내려간다",
            evaluation: "risky",
            reaction: "이 선택은 실제 상황에선 위험할 수 있어.",
            reason:
              "화재 시 정전이나 오작동으로 엘리베이터에 갇힐 위험이 크다. 반드시 계단을 이용해야 한다.",
            next: "fire-4",
          },
        ],
        verifiedPrinciple:
          "연기 속에서는 자세를 낮추고 젖은 천으로 코와 입을 막아 유독가스 흡입을 최소화하며, 엘리베이터 대신 계단으로 이동한다.",
        next: "fire-4",
      },

      // ── 판단 3-B (위험 경로 분기: 바로 문을 연 결과) ──
      {
        id: "fire-3-danger",
        order: 3,
        situation:
          "문을 열자마자 복도의 열기와 연기가 훅 들이닥쳤다. 순간 숨이 막혔지만 다행히 아직 이동은 가능하다. 앞선 판단 탓에 상황이 조금 나빠졌다. 이제 어떻게 이동할까?",
        imageAlt: "열린 문 사이로 연기가 밀려드는 순간, 몸을 움츠린 사람의 실루엣을 담은 차분하지만 긴장감 있는 일러스트",
        imageMood: "tense",
        inputType: "choice",
        choices: [
          {
            id: "fire-3d-low",
            label: "자세를 낮추고 젖은 천으로 코와 입을 막은 뒤 계단으로 이동한다",
            evaluation: "recommended",
            reaction: "좋아. 늦지 않게 방향을 바로잡았어.",
            reason:
              "연기 속에서는 바닥 쪽 공기가 상대적으로 깨끗하다. 자세를 낮추고 호흡기를 보호하면 유독가스 흡입을 줄일 수 있고, 화재 시엔 계단을 이용해야 한다.",
            next: "fire-4",
          },
          {
            id: "fire-3d-run",
            label: "선 채로 빠르게 뛰어서 대피한다",
            evaluation: "risky",
            reaction: "이 선택은 실제 상황에선 위험할 수 있어.",
            reason:
              "이미 연기가 들어온 상황에서 서서 뛰면 유독가스를 더 많이 들이마시게 된다. 자세를 낮춰야 한다.",
            next: "fire-4",
          },
          {
            id: "fire-3d-elev",
            label: "가장 빠른 엘리베이터로 내려간다",
            evaluation: "risky",
            reaction: "이 선택은 실제 상황에선 위험할 수 있어.",
            reason:
              "화재 시 정전이나 오작동으로 엘리베이터에 갇힐 위험이 크다. 반드시 계단을 이용해야 한다.",
            next: "fire-4",
          },
        ],
        verifiedPrinciple:
          "연기 속에서는 자세를 낮추고 젖은 천으로 코와 입을 막아 유독가스 흡입을 최소화하며, 엘리베이터 대신 계단으로 이동한다.",
        next: "fire-4",
      },

      // ── 판단 4 (자유응답) ──
      {
        id: "fire-4",
        order: 4,
        situation:
          "계단 쪽으로 향했지만 연기가 예상보다 훨씬 짙다. 시야 확보가 어렵고 숨쉬기도 힘들어 보인다. 계속 내려가야 할지 망설여진다.",
        prompt: "지금 이 상황을 어떻게 판단할래? 무엇을 할지 네 말로 적어줘.",
        placeholder: "나라면…",
        imageAlt: "짙은 연기로 뒤덮인 계단 입구 앞에서 잠시 멈춰선 사람의 실루엣을 담은 차분한 일러스트",
        imageMood: "tense",
        inputType: "freeText",
        evaluationCriteria: [
          {
            action: "시야가 막힌 연기 속 강행을 멈추고 다른 방법을 찾음",
            verdict: "good",
            note: "짙은 연기 속 강행은 방향 상실·질식 위험이 크다. 무리한 진입을 멈추는 판단이 안전하다.",
          },
          {
            action: "방(안전한 공간)으로 돌아가 문을 닫고 문틈을 막음",
            verdict: "good",
            note: "대피로가 막혔을 때는 문을 닫아 연기 유입을 차단하는 것이 원칙이다.",
          },
          {
            action: "창가 등에서 구조를 요청하려 함",
            verdict: "good",
            note: "구조대가 발견하기 쉬운 곳에서 신호를 보내는 것이 안전한 대기 방법이다.",
          },
          {
            action: "짙은 연기 속 계단으로 그대로 강행함",
            verdict: "risky",
            note: "시야가 확보되지 않는 연기 속을 강행하면 방향을 잃거나 질식할 위험이 크다.",
          },
          {
            action: "연기 짙은 통로에 그대로 머무르며 대기만 함",
            verdict: "risky",
            note: "연기가 짙은 곳에 머무르면 유독가스 노출 시간이 길어진다. 안전한 공간으로 물러나야 한다.",
          },
        ],
        fallbackFreeText:
          "지금은 네 문장을 AI가 자세히 해석하기 어려운 상태야. 대신 이 상황에서 검증된 판단 포인트를 함께 짚어볼게.",
        verifiedPrinciple:
          "대피로가 연기로 막혀 진행이 어렵다면 무리하게 이동하지 말고, 문을 닫아 연기 유입을 차단한 뒤 창문 등 구조 신호를 보낼 수 있는 곳에서 구조를 기다린다.",
        next: "fire-5",
      },

      // ── 판단 5 (객관식, 최종) ──
      {
        id: "fire-5",
        order: 5,
        situation:
          "복도 대피가 어렵다고 판단하고 방으로 돌아와 문틈을 막았다. 아직 119에 신고하지 못한 상태다. 지금 무엇을 해야 할까?",
        imageAlt: "창가에 서서 휴대폰을 든 사람과 그 너머 도시의 새벽 풍경을 담은 차분한 일러스트",
        imageMood: "calm",
        inputType: "choice",
        choices: [
          {
            id: "fire-5-report",
            label: "119에 정확한 위치와 상황을 알리고, 창문에서 구조 신호를 보낸다",
            evaluation: "recommended",
            reaction: "좋아. 이 판단이 구조로 이어져.",
            reason:
              "구체적인 위치(동·호수·층)와 상태를 알리면 구조대가 대상을 빠르게 특정한다. 창문에서 밝은 천을 흔들거나 소리를 내면 발견 가능성이 높아진다.",
            next: null,
          },
          {
            id: "fire-5-wait",
            label: "구조대가 알아서 찾아줄 테니 별다른 행동 없이 기다린다",
            evaluation: "risky",
            reaction: "이 선택은 실제 상황에선 위험할 수 있어.",
            reason:
              "정확한 위치와 상황을 알리지 않으면 구조가 지연될 수 있다. 신고와 위치 알림은 반드시 직접 해야 한다.",
            next: null,
          },
          {
            id: "fire-5-jump",
            label: "빨리 벗어나려 창문 밖으로 나갈 방법을 찾는다",
            evaluation: "risky",
            reaction: "이 선택은 실제 상황에선 위험할 수 있어.",
            reason:
              "저층이 아닌 이상 무리한 탈출은 추가 부상 위험이 크다. 안전한 공간을 확보했다면 구조를 기다리는 것이 원칙이다.",
            next: null,
          },
        ],
        verifiedPrinciple:
          "119 신고 시 정확한 주소·층수·상황을 전달하고, 안전한 공간을 확보했다면 무리한 탈출보다 창문 등에서 구조 신호를 보내며 기다린다.",
        next: null,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // EP.02 — 눈앞에서 사람이 쓰러짐 (자유응답 1 + 객관식 2, 분기 포함)
  // ─────────────────────────────────────────────
  {
    id: "collapsed-person",
    title: "EP.02 · 눈앞에서 사람이 쓰러졌다",
    situationTitle: "옆 사람이 갑자기 쓰러졌다",
    category: "emergency",
    description: "지나가던 사람이 갑자기 쓰러졌다. 내 판단이 골든타임을 좌우한다.",
    thumbnail: "collapsed-person",
    estimatedTime: "5분",
    sourceName: "질병관리청 국가건강정보포털 · 심폐소생술 안내",
    sourceUrl:
      "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6227",
    status: "not-started",
    implemented: true,
    startNodeId: "cpr-1",
    totalSteps: 3,
    verifiedPrinciples: [
      "쓰러진 사람은 어깨를 두드리며 반응과 호흡을 먼저 확인한다.",
      "반응과 정상 호흡이 없으면 즉시 119에 신고하고 자동심장충격기(AED)를 요청한다.",
      "정상 호흡이 없으면 지체 없이 가슴 압박을 시작한다.",
      "의식이 없는 사람에게는 입으로 아무것도 넣지 않는다.",
    ],
    nodes: [
      // ── 판단 1 (자유응답) ──
      {
        id: "cpr-1",
        order: 1,
        situation:
          "앞서 걷던 사람이 갑자기 바닥에 쓰러졌다. 주변에는 몇 사람이 걸음을 멈추고 지켜보고 있다. 다들 서로 눈치만 보는 분위기다.",
        prompt: "너라면 지금 가장 먼저 어떻게 할 것 같아?",
        placeholder: "나라면…",
        imageAlt: "거리에서 한 사람이 쓰러지고 주변 사람들이 멈춰선 순간을 담은 차분한 에디토리얼 일러스트",
        imageMood: "tense",
        inputType: "freeText",
        evaluationCriteria: [
          {
            action: "다가가 어깨를 두드리며 반응·호흡을 확인함",
            verdict: "good",
            note: "반응과 호흡 확인은 응급처치의 첫 단계로, 이후 대응을 결정한다.",
          },
          {
            action: "119 신고를 떠올리거나 주변에 도움을 요청함",
            verdict: "good",
            note: "신고와 도움 요청은 전문 구조가 시작되게 하는 핵심 행동이다.",
          },
          {
            action: "상황부터 영상·사진으로 기록함",
            verdict: "risky",
            note: "기록보다 사람의 상태 확인이 우선이다. 골든타임 안의 판단이 결과를 좌우한다.",
          },
          {
            action: "추가 위험이 없는데 함부로 몸을 옮김",
            verdict: "risky",
            note: "명백한 추가 위험이 없다면 섣부른 이동은 부상을 악화시킬 수 있다.",
          },
        ],
        fallbackFreeText:
          "지금은 네 문장을 AI가 자세히 해석하기 어려운 상태야. 대신 이 상황에서 검증된 판단 포인트를 함께 짚어볼게.",
        verifiedPrinciple:
          "쓰러진 사람을 발견하면 어깨를 두드리며 말을 걸어 반응 여부를 확인하고, 동시에 호흡 상태를 관찰한다.",
        next: "cpr-2",
      },

      // ── 판단 2 (객관식, 분기 지점) ──
      {
        id: "cpr-2",
        order: 2,
        situation:
          "다가가 어깨를 두드리며 불러도 반응이 없고, 가슴도 정상적으로 움직이지 않는 것 같다. 지금 무엇을 해야 할까?",
        imageAlt: "쓰러진 사람 옆에 무릎을 꿇고 휴대폰을 든 사람을 담은 차분한 일러스트",
        imageMood: "tense",
        inputType: "choice",
        choices: [
          {
            id: "cpr-2-call",
            label: "즉시 119에 신고하고, 주변 사람에게 AED를 요청한다",
            evaluation: "recommended",
            reaction: "좋아. 지금 판단은 방향이 맞아.",
            reason:
              "반응과 정상 호흡이 없다면 즉시 신고하고 도움을 요청하는 것이 원칙이다. 주변 사람에게 역할을 나눠 신고와 AED 확보를 동시에 진행할 수 있다.",
            next: "cpr-3-normal",
          },
          {
            id: "cpr-2-wait",
            label: "조금 더 지켜보며 스스로 깨어나기를 기다린다",
            evaluation: "risky",
            reaction: "이 선택은 실제 상황에선 위험할 수 있어.",
            reason:
              "반응과 정상 호흡이 없는 상태는 심정지를 의심해야 하는 응급상황이다. 기다리는 시간만큼 소생 가능성이 낮아진다.",
            next: "cpr-3-delay",
          },
          {
            id: "cpr-2-alone",
            label: "신고는 나중에 하고 혼자 가슴 압박부터 시작한다",
            evaluation: "caution",
            reaction: "여기서 많이들 헷갈려.",
            reason:
              "가슴 압박은 꼭 필요하지만, 신고가 이루어져야 구급대가 출동한다. 신고를 최우선으로, 혹은 주변에 신고를 부탁하며 압박을 진행해야 한다.",
            next: "cpr-3-normal",
          },
        ],
        verifiedPrinciple:
          "반응이 없고 정상 호흡이 확인되지 않으면 즉시 119에 신고하고, 주변에 자동심장충격기(AED)를 요청한다.",
        next: "cpr-3-normal",
      },

      // ── 판단 3-A (정상 경로) ──
      {
        id: "cpr-3-normal",
        order: 3,
        situation:
          "신고를 마쳤고, 주변 사람이 AED를 가지러 갔다. 상대는 여전히 반응이 없고 정상적으로 숨 쉬지 않는다. 지금 무엇을 해야 할까?",
        imageAlt: "무릎을 꿇고 두 손을 깍지 껴 가슴 압박을 준비하는 사람을 담은 차분한 일러스트",
        imageMood: "tense",
        inputType: "choice",
        choices: [
          {
            id: "cpr-3n-compress",
            label: "가슴 중앙에 손을 겹쳐 올리고 강하고 빠르게 압박을 시작한다",
            evaluation: "recommended",
            reaction: "좋아. 지체 없이 시작하는 게 맞아.",
            reason:
              "정상 호흡이 없다면 지체 없이 가슴 압박을 시작하는 것이 원칙이다. 가슴 중앙을 분당 100~120회 속도로, 성인 기준 약 5cm 깊이로 압박한다.",
            next: null,
          },
          {
            id: "cpr-3n-position",
            label: "회복자세로 옆으로 눕히고 기다린다",
            evaluation: "risky",
            reaction: "이 선택은 실제 상황에선 위험할 수 있어.",
            reason:
              "회복자세는 호흡이 있는 사람에게 적용하는 자세다. 정상 호흡이 없다면 지체 없이 가슴 압박을 시작해야 한다.",
            next: null,
          },
          {
            id: "cpr-3n-water",
            label: "물을 먹여 정신을 차리게 한다",
            evaluation: "risky",
            reaction: "이 선택은 실제 상황에선 위험할 수 있어.",
            reason:
              "의식이 없는 사람에게 무언가를 먹이면 기도를 막아 질식으로 이어질 수 있다. 입에 아무것도 넣지 않는다.",
            next: null,
          },
        ],
        verifiedPrinciple:
          "정상 호흡이 없다면 지체 없이 가슴 압박을 시작한다. 가슴 중앙을 분당 100~120회 속도로 약 5cm 깊이로 압박한다.",
        next: null,
      },

      // ── 판단 3-B (지체된 경로: 지켜보다 시간이 흐른 결과) ──
      {
        id: "cpr-3-delay",
        order: 3,
        situation:
          "잠깐 지켜보는 사이 시간이 흘렀다. 상대는 여전히 반응이 없고 숨도 쉬지 않는다. 골든타임이 줄어들고 있다. 지금이라도 무엇을 해야 할까?",
        imageAlt: "쓰러진 사람 곁에서 다급하게 몸을 숙이는 사람을 담은 차분하지만 긴장감 있는 일러스트",
        imageMood: "tense",
        inputType: "choice",
        choices: [
          {
            id: "cpr-3d-compress",
            label: "지금이라도 즉시 119에 신고하고 가슴 압박을 시작한다",
            evaluation: "recommended",
            reaction: "좋아. 늦었지만 지금이라도 바로잡았어.",
            reason:
              "심정지에서는 1분 1초가 중요하다. 지금이라도 신고와 함께 가슴 중앙을 분당 100~120회, 약 5cm 깊이로 압박을 시작해야 한다.",
            next: null,
          },
          {
            id: "cpr-3d-position",
            label: "회복자세로 옆으로 눕히고 기다린다",
            evaluation: "risky",
            reaction: "이 선택은 실제 상황에선 위험할 수 있어.",
            reason:
              "회복자세는 호흡이 있는 사람에게 적용하는 자세다. 정상 호흡이 없다면 지체 없이 가슴 압박을 시작해야 한다.",
            next: null,
          },
          {
            id: "cpr-3d-wait",
            label: "구급차가 올 때까지 더 지켜본다",
            evaluation: "risky",
            reaction: "이 선택은 실제 상황에선 위험할 수 있어.",
            reason:
              "구급대 도착 전까지의 가슴 압박이 소생률을 크게 높인다. 기다리기만 하면 골든타임을 놓친다.",
            next: null,
          },
        ],
        verifiedPrinciple:
          "정상 호흡이 없으면 지체 없이 가슴 압박을 시작한다. 구급대 도착 전까지의 즉각적인 압박이 소생률을 높인다.",
        next: null,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 라이브러리 표시용 (준비 중)
  // 모든 콘텐츠는 위험 회피·대피·신고·응급 대응 관점으로만 구성한다.
  // 공격 방법이나 타인에게 위해를 가하는 방법은 다루지 않는다.
  // ─────────────────────────────────────────────

  // ── 생활 속 응급 ──
  comingSoon({
    id: "choking",
    situationTitle: "함께 밥을 먹던 친구가 갑자기 숨을 못 쉰다",
    category: "emergency",
    description: "목을 부여잡고 기침도 못 한다. 이럴 때 나는 뭘 해야 하지?",
    thumbnail: "choking",
    estimatedTime: "4분",
    sourceName: "질병관리청 국가건강정보포털",
    sourceUrl: "https://health.kdca.go.kr",
  }),
  comingSoon({
    id: "burn",
    situationTitle: "뜨거운 물을 쏟아 심하게 데었다",
    category: "emergency",
    description: "빨갛게 부어오르기 시작하는 피부. 얼음? 연고? 뭐가 맞을까.",
    thumbnail: "burn",
    estimatedTime: "3분",
    sourceName: "대한화상학회 · 질병관리청",
    sourceUrl: "https://health.kdca.go.kr",
  }),
  comingSoon({
    id: "nosebleed",
    situationTitle: "코피가 멈추지 않는다",
    category: "emergency",
    description: "고개를 들어야 할까, 숙여야 할까. 의외로 헷갈리는 순간.",
    thumbnail: "nosebleed",
    estimatedTime: "3분",
    sourceName: "질병관리청 국가건강정보포털",
    sourceUrl: "https://health.kdca.go.kr",
  }),

  // ── 도시에서 ──
  comingSoon({
    id: "subway-smoke",
    situationTitle: "지하철 안으로 연기가 들어오기 시작한다",
    category: "urban",
    description: "옆 칸에서부터 스며드는 연기. 문이 안 열리면 어떻게 하지?",
    thumbnail: "subway-smoke",
    estimatedTime: "6분",
    sourceName: "소방청 국민재난안전포털",
    sourceUrl: "https://www.safekorea.go.kr",
  }),
  comingSoon({
    id: "elevator-stuck",
    situationTitle: "엘리베이터가 층 사이에서 갑자기 멈췄다",
    category: "urban",
    description: "불이 깜빡이고 문은 안 열린다. 억지로 열어도 될까?",
    thumbnail: "elevator",
    estimatedTime: "4분",
    sourceName: "행정안전부 · 한국승강기안전공단",
    sourceUrl: "https://www.safekorea.go.kr",
  }),
  comingSoon({
    id: "crowd-run",
    situationTitle: "길에서 갑자기 사람들이 한쪽으로 뛰기 시작했다",
    category: "urban",
    description: "무슨 일인지는 모르지만, 분위기가 심상치 않다. 어디로 움직여야 할까.",
    thumbnail: "crowd",
    estimatedTime: "5분",
    sourceName: "행정안전부 국민재난안전포털",
    sourceUrl: "https://www.safekorea.go.kr",
  }),
  comingSoon({
    id: "car-crash",
    situationTitle: "눈앞에서 큰 교통사고가 났다",
    category: "urban",
    description: "차가 부딪히고 사람이 보인다. 다가가도 될까, 뭘 먼저 해야 할까.",
    thumbnail: "car-crash",
    estimatedTime: "5분",
    sourceName: "소방청 · 도로교통공단",
    sourceUrl: "https://www.safekorea.go.kr",
  }),

  // ── 재난 ──
  comingSoon({
    id: "earthquake",
    situationTitle: "책상이 흔들리고 창문이 덜컹거린다",
    category: "disaster",
    description: "바닥이 흔들린다. 밖으로 뛰어나가는 게 맞을까?",
    thumbnail: "earthquake",
    estimatedTime: "5분",
    sourceName: "행정안전부 국민재난안전포털",
    sourceUrl: "https://www.safekorea.go.kr",
  }),
  comingSoon({
    id: "flooded-basement",
    situationTitle: "지하주차장에 물이 빠르게 차오른다",
    category: "disaster",
    description: "차를 빼러 내려갔더니 물이 발목까지. 차가 먼저일까 내가 먼저일까.",
    thumbnail: "flooded-basement",
    estimatedTime: "5분",
    sourceName: "행정안전부 국민재난안전포털",
    sourceUrl: "https://www.safekorea.go.kr",
  }),
  comingSoon({
    id: "car-submerge",
    situationTitle: "물에 빠진 차 안에 물이 차오른다",
    category: "disaster",
    description: "문이 안 열린다. 창문을 깨야 할까, 물이 찰 때까지 기다려야 할까.",
    thumbnail: "car-water",
    estimatedTime: "5분",
    sourceName: "행정안전부 · 소방청",
    sourceUrl: "https://www.safekorea.go.kr",
  }),
  comingSoon({
    id: "explosion",
    situationTitle: "가까운 곳에서 큰 폭발음이 울렸다",
    category: "disaster",
    description: "무슨 일인지 모르지만 창문이 흔들렸다. 나가야 할까, 숨어야 할까.",
    thumbnail: "blast",
    estimatedTime: "6분",
    sourceName: "행정안전부 국민재난안전포털",
    sourceUrl: "https://www.safekorea.go.kr",
  }),
  comingSoon({
    id: "nuclear-alert",
    situationTitle: "핵·방사능 경보 문자가 울렸다",
    category: "disaster",
    description: "드물지만 한 번쯤 궁금했던 상황. 실내가 안전할까, 어디로 대피할까.",
    thumbnail: "alert",
    estimatedTime: "6분",
    sourceName: "행정안전부 국민재난안전포털",
    sourceUrl: "https://www.safekorea.go.kr",
  }),

  // ── 반려동물 ──
  comingSoon({
    id: "pet-seizure",
    situationTitle: "반려견이 갑자기 발작을 일으킨다",
    category: "pet",
    description: "몸을 떨며 쓰러진 우리 강아지. 붙잡아야 할까, 지켜봐야 할까.",
    thumbnail: "pet",
    estimatedTime: "4분",
    sourceName: "농림축산검역본부 · 수의 응급처치 지침",
    sourceUrl: "https://www.animal.go.kr",
  }),
  comingSoon({
    id: "pet-swallow",
    situationTitle: "반려동물이 이물질을 삼킨 것 같다",
    category: "pet",
    description: "뭔가를 꿀꺽 삼켰다. 토하게 해야 할까, 그러면 안 될까.",
    thumbnail: "pet",
    estimatedTime: "4분",
    sourceName: "농림축산검역본부 · 수의 응급처치 지침",
    sourceUrl: "https://www.animal.go.kr",
  }),
  comingSoon({
    id: "pet-collapse",
    situationTitle: "산책 중 반려견이 갑자기 쓰러졌다",
    category: "pet",
    description: "여름 산책길, 혀를 빼물고 헐떡이다 주저앉았다. 무엇부터 할까.",
    thumbnail: "pet",
    estimatedTime: "4분",
    sourceName: "농림축산검역본부 · 수의 응급처치 지침",
    sourceUrl: "https://www.animal.go.kr",
  }),

  // ── 예상 밖의 상황 ──
  comingSoon({
    id: "lost-mountain",
    situationTitle: "산에서 내려오는 길을 잃었다",
    category: "unexpected",
    description: "해가 지는데 길이 안 보인다. 계속 걸어야 할까, 멈춰야 할까.",
    thumbnail: "mountain",
    estimatedTime: "5분",
    sourceName: "국립공원공단 · 소방청",
    sourceUrl: "https://www.safekorea.go.kr",
  }),
  comingSoon({
    id: "beach-drift",
    situationTitle: "해변에서 사람이 파도에 떠내려간다",
    category: "unexpected",
    description: "손을 흔드는 사람이 점점 멀어진다. 헤엄쳐 들어가도 될까.",
    thumbnail: "sea",
    estimatedTime: "5분",
    sourceName: "해양경찰청 · 행정안전부",
    sourceUrl: "https://www.safekorea.go.kr",
  }),
  comingSoon({
    id: "inflight",
    situationTitle: "비행 중 기내에서 옆 사람이 쓰러졌다",
    category: "unexpected",
    description: "고도 1만 미터, 병원은 없다. 이럴 땐 어떻게 도와야 할까.",
    thumbnail: "plane",
    estimatedTime: "5분",
    sourceName: "질병관리청 · 대한적십자사",
    sourceUrl: "https://health.kdca.go.kr",
  }),
  comingSoon({
    id: "gas-smell",
    situationTitle: "집에서 갑자기 가스 냄새가 난다",
    category: "unexpected",
    description: "환기부터? 불부터 끄기? 스위치를 켜도 될까 안 될까.",
    thumbnail: "gas",
    estimatedTime: "4분",
    sourceName: "한국가스안전공사 · 소방청",
    sourceUrl: "https://www.safekorea.go.kr",
  }),
  comingSoon({
    id: "blackout",
    situationTitle: "정전으로 건물 전체가 암전됐다",
    category: "unexpected",
    description: "복도도 계단도 캄캄하다. 휴대폰 불빛 하나로 어떻게 움직일까.",
    thumbnail: "dark",
    estimatedTime: "4분",
    sourceName: "행정안전부 국민재난안전포털",
    sourceUrl: "https://www.safekorea.go.kr",
  }),
];

/** 준비 중 시나리오를 간결하게 만드는 헬퍼 (노드는 비어 있음) */
function comingSoon(input: {
  id: string;
  situationTitle: string;
  category: Scenario["category"];
  description: string;
  thumbnail: string;
  estimatedTime: string;
  sourceName: string;
  sourceUrl: string;
}): Scenario {
  return {
    ...input,
    title: input.situationTitle,
    status: "coming-soon",
    implemented: false,
    startNodeId: "",
    totalSteps: 0,
    verifiedPrinciples: [],
    nodes: [],
  };
}

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}

export function getImplementedScenarios(): Scenario[] {
  return scenarios.filter((s) => s.implemented);
}

export function getNode(scenario: Scenario, nodeId: string) {
  return scenario.nodes.find((n) => n.id === nodeId);
}

// 홈에서 보여줄 큐레이션 순서 — 흔한 상황과 극단적인 상황을 섞어
// 스크롤하며 "이런 것도 다뤄?" 하는 발견이 생기게 한다.
const HOME_ORDER = [
  "studio-fire",
  "choking",
  "crowd-run",
  "pet-seizure",
  "flooded-basement",
  "nuclear-alert",
  "collapsed-person",
  "elevator-stuck",
  "lost-mountain",
  "car-submerge",
  "gas-smell",
  "beach-drift",
  "subway-smoke",
  "inflight",
  "earthquake",
];

/** 홈 노출용 큐레이션 시나리오 (기본 12개, 원하면 개수 조정) */
export function getHomeScenarios(limit = 12): Scenario[] {
  const byId = new Map(scenarios.map((s) => [s.id, s]));
  const ordered = HOME_ORDER.map((id) => byId.get(id)).filter(
    (s): s is Scenario => Boolean(s)
  );
  return ordered.slice(0, limit);
}
