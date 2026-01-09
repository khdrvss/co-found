import { useEffect, useState } from "react";
import { PersonCard } from "@/components/cards/PersonCard";
import { mockPeople, Person } from "@/data/mockPeople";

export function PeopleSection() {
  const [people, setPeople] = useState<Person[]>(mockPeople);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/people");
        if (!res.ok) return; // fallback to mocks
        const data = await res.json();
        // Map DB rows to Person shape
        const mapped: Person[] = data.map((p: any) => ({
          id: p.id,
          full_name: p.full_name,
          name: p.full_name,
          role: p.role,
          roles: p.roles,
          bio: p.bio,
          skills: p.skills,
          looking_for: p.looking_for,
          available: p.available,
          avatar_url: p.avatar_url,
          viloyat: p.viloyat,
          user_id: p.user_id,
          email: p.email,
          telegram_url: p.telegram_url,
          instagram_url: p.instagram_url,
          linkedin_url: p.linkedin_url,
        }));
        if (mapped.length) setPeople(mapped);
      } catch (_) {
        // keep mocks on failure
      }
    };
    load();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {people.map((person, index) => (
        <PersonCard key={person.id} person={person} index={index} />
      ))}
    </div>
  );
}
