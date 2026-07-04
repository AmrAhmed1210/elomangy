import { Link } from "react-router-dom";
import Card from "../common/Card";

export default function SessionCard({ session }) {
  return (
    <Card
      to={`/training-sessions/${session.id}`}
      title={session.title}
      subtitle={session.description}
      badge={session.mode === 'videos' ? 'Direct Videos' : 'Categorized'}
      hoverColor="lab-teal"
    />
  );
}
