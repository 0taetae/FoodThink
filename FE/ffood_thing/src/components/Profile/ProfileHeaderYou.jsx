import React, { useState, useEffect } from "react";
import BackgroundEffect from "./BackgroundEffect";
import "../../styles/profile/ProfileHeader.css";
import Swal from "sweetalert2";

const ProfileHeaderYou = ({ nickname }) => {
  const [season, setSeason] = useState("spring");
  const [background, setBackground] = useState("#FFEBE9");
  const [profileData, setProfileData] = useState({});
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ 프로필 데이터 가져오기
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`https://i12e107.p.ssafy.io/api/users/read/another-info/${nickname}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("프로필 데이터를 불러오는 데 실패했습니다.");
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error("❌ 프로필 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
    fetchSubscriptionStatus(); // ✅ 구독 상태 체크 추가
  }, [nickname]);

  // ✅ 구독 상태 확인
  const fetchSubscriptionStatus = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const response = await fetch(`https://i12e107.p.ssafy.io/api/subscription/status/${nickname}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("구독 상태 확인 실패");
      const data = await response.json();
      setIsSubscribed(data.isSubscribed);
    } catch (error) {
      console.error("❌ 구독 상태 확인 실패:", error);
    }
  };

  // ✅ 구독하기 / 구독 취소
  const handleSubscribeToggle = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      Swal.fire("로그인 필요", "구독하려면 로그인해주세요.", "warning");
      return;
    }

    const url = isSubscribed
      ? `https://i12e107.p.ssafy.io/api/subscription/cancel/${nickname}`
      : `https://i12e107.p.ssafy.io/api/subscription/add/${nickname}`;

    try {
      await fetch(url, {
        method: isSubscribed ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      setIsSubscribed(!isSubscribed);
      Swal.fire("완료!", isSubscribed ? "구독 취소됨" : "구독 완료!", "success");
    } catch (error) {
      Swal.fire("오류", "구독 상태 변경 실패", "error");
    }
  };

  if (loading) return <div className="profile-header">🔄 프로필 로딩 중...</div>;

  return (
    <div className="profile-header" style={{ background }}>
      {/* 배경 이펙트 추가 */}
      <BackgroundEffect season={season} setSeason={setSeason} setBackground={setBackground} />

      <div className="profile-content">
        {/* 프로필 이미지 */}
        <div className="profile-avatar-container">
          <img src={profileData.image || "/default_profile.png"} alt="프로필" className="profile-avatar" />
        </div>

        {/* 닉네임 */}
        <div className="profile-details">
          <div className="profile-username">{profileData.nickname}</div>

          {/* 구독 버튼 */}
          <button
            className={`subscriber-button ${isSubscribed ? "subscribed" : ""}`}
            onClick={handleSubscribeToggle}
          >
            {isSubscribed ? "구독 중" : "구독하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderYou;
