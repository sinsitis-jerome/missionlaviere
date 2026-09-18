import type { HouseholdMember } from '../types';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function MemberAvatar({
  member,
  size = 32,
  title,
}: {
  member: Pick<HouseholdMember, 'displayName' | 'photoURL' | 'colorTag'>;
  size?: number;
  title?: string;
}) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.4, borderColor: member.colorTag }}
      title={title ?? member.displayName}
    >
      {member.photoURL ? (
        <img src={member.photoURL} alt="" referrerPolicy="no-referrer" />
      ) : (
        <span style={{ background: member.colorTag }} className="avatar__fallback">
          {initials(member.displayName)}
        </span>
      )}
    </span>
  );
}
