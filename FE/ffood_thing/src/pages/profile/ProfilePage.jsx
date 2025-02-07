import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileHeader from "../../components/Profile/ProfileHeader";
import ProfileTabs from "../../components/Profile/ProfileTabs";
import RecipeList from "../../components/Profile/RecipeList";
import BookmarkList from "../../components/Profile/BookmarkList";
import FeedList from "../../components/Profile/FeedList";
import Swal from "sweetalert2";
import "../../styles/profile/ProfilePage.css";

const ProfilePage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recipes");
  const [userId, setUserId] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  // const [isDeleting, setIsDeleting] = useState(false); // 탈퇴 모달 상태

  // ✅ 로그인 여부 확인 및 userId 복구
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    let storedUserId = localStorage.getItem("userId");

    console.log("🔑 현재 로그인된 userId:", storedUserId);
    console.log("🔑 저장된 accessToken:", token);

    // ✅ Access Token 없으면 로그인 페이지로 강제 이동
    if (!token) {
      console.error("🚨 Access Token 없음 → 로그인 필요");
      alert("로그인이 필요합니다.");
      localStorage.clear(); // 🛑 불필요한 값 제거
      navigate("/login");
      return;
    }

    // ✅ userId가 없는 경우, JWT 토큰에서 복구 시도
    if (!storedUserId) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1])); // JWT 디코딩
        console.log("📌 디코딩된 JWT:", decodedToken);

        if (decodedToken.userId) {
          storedUserId = decodedToken.userId;
          localStorage.setItem("userId", storedUserId);
        } else if (decodedToken.sub) {
          storedUserId = decodedToken.sub;
          localStorage.setItem("userId", storedUserId);
        } else {
          throw new Error("❌ JWT에서 userId를 찾을 수 없음");
        }

        console.log("✅ 복구된 userId:", storedUserId);
      } catch (error) {
        console.error("❌ JWT 디코딩 실패:", error);
        localStorage.clear(); // 🛑 불필요한 값 제거 후 로그인 페이지로 이동
        navigate("/login");
        return;
      }
    }

    if (!storedUserId) {
      console.error("🚨 userId 없음 → 로그인 필요");
      alert("로그인이 필요합니다.");
      localStorage.clear();
      navigate("/login");
      return;
    }

    setUserId(storedUserId);
    setIsOwnProfile(id === storedUserId);
    setLoading(false);
  }, [id, navigate]);


  // ✅ 회원 탈퇴 함수
  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      Swal.fire("로그인이 필요합니다.", "", "error");
      return;
    }

    // ✅ 첫 번째 안내창 (탈퇴 확인)
  Swal.fire({
    title: "정말 탈퇴하시겠습니까? 😢",
    text: "탈퇴 후에는 복구가 불가능합니다.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "탈퇴하기",
    cancelButtonText: "취소",
  }).then(async (result) => {
    if (result.isConfirmed) {
      // ✅ 탈퇴 API 요청
      try {
        const response = await fetch("https://i12e107.p.ssafy.io/api/users/delete", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`회원 탈퇴 실패: ${response.status}`);
        }

        // ✅ 두 번째 안내창 (탈퇴 성공)
        Swal.fire({
          title: "회원 탈퇴 완료",
          text: "그동안 이용해주셔서 감사합니다.",
          icon: "success",
        }).then(() => {
          localStorage.clear(); // ✅ 저장된 로그인 정보 삭제
          navigate("/login"); // ✅ 로그인 페이지로 이동
        });

      } catch (error) {
        console.error("❌ 회원 탈퇴 오류:", error);
        Swal.fire("회원 탈퇴 중 오류가 발생했습니다.", "", "error");
      }
    }
  });
};

  if (loading) {
    return <div className="loading-text">🔄 로그인 확인 중...</div>;
  }

  return (
    <div className="base-div">
      <div className="parent-container">
        <div className="card-div">
          <div className="profile-container">
            <ProfileHeader userId={id} isOwnProfile={isOwnProfile} />

            {isOwnProfile && (
              <div className="profile-actions">
                {/* 회원 탈퇴 버튼 추가 */}
                <button className="btn btn-danger" onClick={handleDeleteAccount}>
                  회원 탈퇴
                </button>
              </div>
            )}

            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} userId={id} />

            <div className="tab-content">
              {activeTab === "recipes" && <RecipeList userId={id} />}
              {activeTab === "bookmarks" && <BookmarkList userId={id} />}
              {activeTab === "feed" && <FeedList userId={id} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
