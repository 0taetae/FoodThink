import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import "../../styles/base/global.css";
import "../../styles/recommend/AiRecommendPage.css";
import LoginCheck from "../../components/base/LoginCheck";

const questionsData = [
  { question: "어떤 맛을 원하시나요?", options: ["매운 음식", "단 음식", "짠 음식"] },
  { question: "어떤 종류의 음식을 원하시나요?", options: ["국물요리", "밥종류", "면요리"] },
  { question: "요리 난이도를 선택해주세요.", options: ["쉬운 요리", "보통 난이도의 요리", "어려운 요리"] },
  { question: "어떤 식사를 원하시나요?", options: ["아침식사", "점심식사", "저녁식사"] },
  { question: "요리 스타일을 선택해주세요.", options: ["간단요리", "정통요리", "퓨전요리"] },
  { question: "어떤 주재료를 원하시나요?", options: ["닭고기", "돼지고기", "소고기"] },
  { question: "채소를 많이 포함한 요리를 원하시나요?", options: ["채소가 많이", "채소가 조금", "채소 없이"] },
  { question: "특정 국가 요리를 원하시나요?", options: ["한식", "양식", "중식"] },
  { question: "매운 정도를 선택해주세요.", options: ["안 매운맛", "보통 매운맛", "아주 매운맛"] },
  { question: "시간이 얼마나 걸릴까요?", options: ["10분 이내", "30분 이내", "1시간 이상"] },
  { question: "어떤 조리 방법을 원하시나요?", options: ["볶음", "튀김", "찜"] },
  { question: "누구와 함께 식사를 하나요?", options: ["혼자먹어요", "친구와 함께", "가족과 함께"] },
  { question: "어떤 식감을 원하시나요?", options: ["부드러운", "쫄깃한", "바삭한"] },
  // { question: "예산 범위는 어느 정도인가요?", options: ["저렴한 재료", "보통 가격", "고급 재료"] }, //애매...
  { question: "기분에 따라 어떤 요리를 드시고 싶나요?", options: ["기운 나는 음식", "가벼운 음식", "든든한 음식"] },
  { question: "어떤 국물을 선호하시나요?", options: ["맑은 국물", "걸쭉한 국물", "국물 없이"] },

];

function AiRecommendPage() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // UserContext에서 user 가져오기
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);

  // localStorage에서 accessToken 가져오기
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const shuffled = [...questionsData].sort(() => 0.5 - Math.random()).slice(0, 5);
    setQuestions(shuffled);
  }, []);

  useEffect(() => {
    console.log("🔥 UserContext에서 가져온 user:", user);
    console.log("📌 LocalStorage에서 가져온 token:", token);
  }, [user, token]);

  const handleChoice = (answer) => {
    console.log(`선택한 답변: ${answer}`);

    setAnswers((prev) => {
      const updatedAnswers = [...prev, answer];
      console.log("📌 현재까지의 답변 리스트:", updatedAnswers);

      if (updatedAnswers.length === 5) {
        sendToBackend(updatedAnswers);
      } else {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }
      return updatedAnswers;
    });
  };

  const sendToBackend = async (userAnswers) => {
    setLoading(true);
  
    const API_URL = "https://i12e107.p.ssafy.io/api/recommend/final-recommend";
    const requestData = { answers: userAnswers }; // JSON 배열 그대로 유지
  
    console.log("📌 API 요청 시작:", JSON.stringify(requestData, null, 2));
    console.log("📌 사용 중인 토큰:", token);
  
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestData), // JSON 배열 그대로 변환하여 전송
      });
  
      console.log("📌 서버 응답 상태 코드:", response.status);
  
      const responseText = await response.text();
      console.log("📌 서버 응답 원문:", responseText);
  
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("❌ JSON 파싱 오류. 응답이 JSON이 아닐 가능성 있음:", responseText);
        throw new Error("서버에서 올바른 JSON을 반환하지 않았습니다.");
      }
  
      console.log("📌 백엔드 응답 데이터 (JSON):", data);
  
      if (!Array.isArray(data)) {
        console.error("❌ 추천 데이터가 배열 형식이 아닙니다. 서버 응답:", data);
        throw new Error("추천된 레시피가 없습니다.");
      }
  
      setRecipes(data);
    } catch (error) {
      console.error("❌ 추천 요청 실패:", error);
      alert("추천된 레시피를 불러오지 못했습니다.");
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
            <div className="speech-bubble">
              {recipes.length > 0 ? "🍽 추천된 레시피 🍽" : questions[currentIndex]?.question}
            </div>
            <div className="ai-content">
              {recipes.length === 0 ? (
                questions[currentIndex]?.options.map((option, index) => (
                  <div className="choice-card" key={index}>
                    <button className="choice-btn" onClick={() => handleChoice(option)}>
                      {option}
                    </button>
                  </div>
                ))
              ) : (
                <div className="recipe-list">
                  {recipes.map((recipe) => (
                    <div key={recipe.recipeId} className="recipe-card" onClick={() => navigate(`/recipes/${recipe.recipeId}`)}>
                      <img src={recipe.image} alt={recipe.recipeTitle} className="recipe-image" />
                      <div className="recipe-title">{recipe.recipeTitle}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
