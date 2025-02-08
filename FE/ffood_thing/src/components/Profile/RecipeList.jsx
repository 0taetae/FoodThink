import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import "../../styles/profile/RecipeList.css";

const RecipeList = ({ userId }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = user?.userId === userId;

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("로그인이 필요합니다.");
          setLoading(false);
          return;
        }

        // API URL 결정 (본인 or 타인)
        const apiUrl = isOwnProfile
          ? "https://i12e107.p.ssafy.io/api/myOwnRecipe/read/myRecipeList"
          : `https://i12e107.p.ssafy.io/api/userRecipe/read/${userId}`;

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`서버 응답 오류: ${response.status}`);

        let data = await response.json();
        console.log("📌 불러온 레시피 데이터:", data);

        // recipeId 내림차순 정렬 (최신순)
        data = data.sort((a, b) => Number(b.recipeId) - Number(a.recipeId));

        setRecipes(data);
      } catch (error) {
        console.error("❌ 레시피 불러오기 실패:", error);
        setError("레시피를 불러오는 중 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchRecipes(); // userId가 존재할 때만 API 호출
  }, [userId, isOwnProfile]); // userId 또는 isOwnProfile 변경 시 재요청

  if (loading) return <div className="recipe-container">⏳ 레시피를 불러오는 중...</div>;
  if (error) return <div className="recipe-container">❌ {error}</div>;
  if (!recipes || recipes.length === 0) {
    return (
      <div className="recipe-container">
        <div className="no-recipes-wrapper">
        <div className="no-recipes-text">📌 등록된 레시피가 없습니다. 😯</div>
        {isOwnProfile && (
          <button className="write-recipe-button" onClick={() => navigate("/recipes/write")}>
            ➕ 레시피 작성하러 가기
          </button>
        )}
      </div>
      </div>
    );
  }

  return (
    <div className="recipe-container">
      <div className="recipe-grid">
        {recipes.map((recipe) => (
          <Link 
            to={`/recipes/${recipe.recipeId}`} 
            key={recipe.recipeId} 
            className="recipe-card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <img src={recipe.image} alt={recipe.recipeTitle} className="recipe-image" />
            <p className="recipe-title1">{recipe.recipeTitle}</p>
            <div className="recipe-meta">
              👁 {recipe.hits} | ⭐ {recipe.bookmarkCount}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecipeList;
