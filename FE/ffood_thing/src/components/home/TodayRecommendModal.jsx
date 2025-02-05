import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/recommend/TodayRecommendModal.css";
import todayRecipeData from "../../data/TodayRecipeData"; // 더미 데이터
import { FaRedo } from "react-icons/fa";

const TodayRecommendModal = ({ isOpen, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(1); // 중앙 카드 인덱스
  const [selectedRecipes, setSelectedRecipes] = useState([]); // 랜덤으로 선택된 음식 3개
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      // 📌 로컬 스토리지에서 기존 추천 데이터를 가져오기
      const storedRecipes = localStorage.getItem("todaySelectedRecipes");
      if (storedRecipes) {
        setSelectedRecipes(JSON.parse(storedRecipes));
      } else {
        generateNewRecipes();
      }

      // 배경 스크롤 방지
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // 📌 새로운 랜덤 음식 3개를 선택하는 함수
  const generateNewRecipes = () => {
    const shuffled = [...todayRecipeData].sort(() => 0.5 - Math.random());
    const newRecipes = shuffled.slice(0, 3);
    setSelectedRecipes(newRecipes);
    localStorage.setItem("todaySelectedRecipes", JSON.stringify(newRecipes)); // 로컬 저장
  };

  if (!isOpen || selectedRecipes.length < 3) return null; // 데이터가 준비되지 않았을 때 렌더링 방지

  // 📌 음식 선택 시 검색 결과 페이지로 이동 (중앙 카드 클릭 시)
  const goToSearchPage = (recipeTitle) => {
    navigate(`/search?query=${encodeURIComponent(recipeTitle)}`);
    onClose();
  };

  // 📌 클릭한 카드를 중앙으로 이동시키는 함수
  const moveToCenter = (index) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      
      <div className="today-recommend-card" onClick={(e) => e.stopPropagation()}>
      
        {/* 닫기 버튼 */}
        <button className="today-close-btn" onClick={onClose}>×</button>
        <button className="refresh-btn" onClick={generateNewRecipes}>
          <FaRedo />
        </button>
        <div className="today-title">
          오늘 뭐 먹지? 🍽️
        </div>

        <div className="today-carousel">
          <div className="recipe-list" style={{ transform: `translateX(${-activeIndex * 10}px)` }}>
            {selectedRecipes.map((recipe, i) => (
              <div
                key={i}
                className={`recipe-item ${i === activeIndex ? "active" : ""}`}
                onClick={() => (i === activeIndex ? goToSearchPage(recipe.title) : moveToCenter(i))}
              >
                <img src={recipe.image} alt={recipe.title} className="recipe-image" />
                {i === activeIndex && <p className="recipe-title-main">{recipe.title}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayRecommendModal;
