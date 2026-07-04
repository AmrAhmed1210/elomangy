import { Link } from "react-router-dom";
import Card from "../common/Card";

export default function CategoryCard({ category, sessionId }) {
  return (
    <Card
      to={`/training-sessions/${sessionId}/${category.id}`}
      title={category.name}
      subtitle={category.description}
      badge="Category"
      hoverColor="answer-green"
    />
  );
}