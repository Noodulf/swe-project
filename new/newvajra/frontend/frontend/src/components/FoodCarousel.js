// src/components/FoodCarousel.js
import React from "react";
import "../styles/foodCarousel.css";

const FoodCarousel = () => {
  const images = [
    "/images/food1.jpg",
    "/images/food2.jpg",
    "/images/food3.jpg",
    "/images/food4.jpg",
    "/images/food5.jpg"
  ];

  return (
    <div className="carousel-container">
      <div className="carousel-track">
        {images.concat(images).map((img, i) => (
          <img key={i} src={img} alt={`food-${i}`} />
        ))}
      </div>
    </div>
  );
};

export default FoodCarousel;
