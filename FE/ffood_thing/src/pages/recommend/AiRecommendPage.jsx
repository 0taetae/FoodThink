import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import Swal from "sweetalert2";
import "../../styles/base/global.css";
import "../../styles/recommend/AiRecommendPage.css";
import LoginCheck from "../../components/base/LoginCheck";

// AI 캐릭터 이미지 배열 (5개)
const aiImages = [
  "/images/꾸덕이.png",
  "/images/끼쟁이.png",
  "/images/샤방이.png",
  "/images/시원이.png",
  "/images/씩씩이.png",
];

const questionsData = [
  {
    question: "어떤 맛을 원하시나요?",
    options: ["매운 음식", "단 음식", "짠 음식"],
  },
  {
    question: "어떤 종류의 음식을 원하시나요?",
    options: ["국물요리", "밥종류", "면요리"],
  },
  {
    question: "요리 난이도를 선택해주세요.",
    options: ["쉬운 요리", "보통 난이도의 요리", "어려운 요리"],
  },
  {
    question: "어떤 식사를 원하시나요?",
    options: ["아침식사", "점심식사", "저녁식사"],
  },
  {
    question: "요리 스타일을 선택해주세요.",
    options: ["간단요리", "정통요리", "퓨전요리"],
  },
  {
    question: "어떤 주재료를 원하시나요?",
    options: ["닭고기", "돼지고기", "소고기"],
  },
  {
    question: "채소를 많이 포함한 요리를 원하시나요?",
    options: ["채소가 많이", "채소가 조금", "채소 없이"],
  },
  {
    question: "특정 국가 요리를 원하시나요?",
    options: ["한식", "양식", "중식"],
  },
  {
    question: "매운 정도를 선택해주세요.",
    options: ["안 매운맛", "보통 매운맛", "아주 매운맛"],
  },
  {
    question: "시간이 얼마나 걸릴까요?",
    options: ["10분 이내", "30분 이내", "1시간 이상"],
  },
  { question: "어떤 조리 방법을 원하시나요?", options: ["볶음", "튀김", "찜"] },
  {
    question: "누구와 함께 식사를 하나요?",
    options: ["혼자먹어요", "친구와 함께", "가족과 함께"],
  },
  {
    question: "어떤 식감을 원하시나요?",
    options: ["부드러운", "쫄깃한", "바삭한"],
  },
  {
    question: "기분에 따라 어떤 요리를 드시고 싶나요?",
    options: ["기운 나는 음식", "가벼운 음식", "든든한 음식"],
  },
  {
    question: "어떤 국물을 선호하시나요?",
    options: ["맑은 국물", "걸쭉한 국물", "국물 없이"],
  },
];

function AiRecommendPage() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [availableQuestions, setAvailableQuestions] = useState([
    ...questionsData,
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [aiImage, setAiImage] = useState(
    aiImages[Math.floor(Math.random() * aiImages.length)]
  ); // 랜덤 이미지 초기값 설정

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    pickNextQuestion();
  }, []);

  // 새로운 질문 선택 (중복 방지)
  const pickNextQuestion = () => {
    if (availableQuestions.length === 0) {
      sendToBackend(answers);
      return;
    }

    const nextIndex = Math.floor(Math.random() * availableQuestions.length);
    setCurrentQuestion(availableQuestions[nextIndex]);
    setAvailableQuestions((prev) => prev.filter((_, i) => i !== nextIndex)); // 선택한 질문 제거

    // 🔹 질문이 변경될 때마다 AI 캐릭터 이미지 랜덤 변경
    setAiImage(aiImages[Math.floor(Math.random() * aiImages.length)]);
  };

  // 답변 선택
  const handleChoice = (answer) => {
    setAnswers((prev) => {
      const updatedAnswers = [...prev, answer];
      if (updatedAnswers.length === 5 || availableQuestions.length === 0) {
        sendToBackend(updatedAnswers);
      } else {
        pickNextQuestion();
      }
      return updatedAnswers;
    });
  };

  // 질문 건너뛰기 (답변 없이 다음 질문)
  const handleSkipQuestion = () => {
    if (availableQuestions.length > 0) {
      pickNextQuestion();
    } else {
      sendToBackend(answers);
    }
  };

  // "엔드 버튼" - 현재까지의 답변으로 API 요청
  const handleEndSurvey = () => {
    sendToBackend(answers);
  };

  // API 요청
  const sendToBackend = async (userAnswers) => {
    setLoading(true);

    try {
      const response = await fetch(
        "https://i12e107.p.ssafy.io/api/recommend/final-recommend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers: userAnswers }),
        }
      );

      const data = await response.json();
      if (!Array.isArray(data)) {
        Swal.fire("알림", "추천된 레시피가 없습니다.", "warning");
        return;
      }
      setRecipes(data);
    } catch (error) {
      Swal.fire("오류 발생", "추천된 레시피를 불러오지 못했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="base-div">
      <LoginCheck />
      <div className="parent-container">
        <div className="card-div">
          <div className="ai-recommend-container">
            {/* 진행 바 */}
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${(answers.length / 5) * 100}%` }}
              ></div>
            </div>

            {/* ✅ 질문지 (말풍선) */}
            <div className="speech-bubble">{currentQuestion?.question}</div>

            {/* ✅ AI 캐릭터 + 대답 버튼 컨테이너 */}
            <div className="ai-question-container">
              {/* 왼쪽: AI 캐릭터 */}
              <div className="ai-image-container">
                <img src={aiImage} alt="AI 도우미" className="ai-image" />
              </div>

              {/* 오른쪽: 대답 버튼 + 선택된 답변 */}
              <div className="answer-section">
                {/* 대답 버튼 3개 */}
                <div className="answer-selection-container">
                  {currentQuestion?.options.map((option, index) => (
                    <button
                      key={index}
                      className="choice-btn"
                      onClick={() => handleChoice(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* 선택된 답변 카드 */}
                <div className="selected-answers">
                  {answers.map((answer, index) => (
                    <div key={index} className="answer-card">
                      {answer}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ✅ 컨트롤 버튼 (오른쪽 하단) */}
            <div className="button-control-container">
              <button className="skip-btn" onClick={handleSkipQuestion}>
                건너뛰기
              </button>
              <button className="end-btn" onClick={handleEndSurvey}>
                바로 추천받기
              </button>
            </div>

            {/* ✅ 결과 페이지 (추천된 레시피) */}
            {recipes.length > 0 && (
              <div className="recipe-list">
                {recipes.map((recipe) => (
                  <div
                    key={recipe.recipeId}
                    className="recipe-card"
                    onClick={() => navigate(`/recipes/${recipe.recipeId}`)}
                  >
                    <img
                      src={recipe.image}
                      alt={recipe.recipeTitle}
                      className="recipe-image"
                    />
                    <div className="recipe-title">{recipe.recipeTitle}</div>
                  </div>
                ))}
              </div>
            )}

            {loading && <div className="loading-text">추천받는 중...</div>}

            {recipes.length > 0 && (
              <button className="btn btn-primary" onClick={() => navigate("/")}>
                홈으로 돌아가기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiRecommendPage;
