import { useEffect, useRef, useState } from "react";
import type { CharacterProfileDto, CustomFieldDto } from "../../data/types";
import { Portrait } from "./Portrait";
import { Icon } from "../icons/Icon";
import "./hero.css";

interface HeroCardProps {
  readonly profile: CharacterProfileDto;
  readonly onChange: (profile: CharacterProfileDto) => void;
}

const DESCRIPTION_CLAMP_LENGTH = 340;
const MAX_PORTRAIT_BYTES = 1_500_000;

function newFieldId(): string {
  return `field-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function CustomFieldsEditor({
  fields,
  onChange,
}: {
  readonly fields: readonly CustomFieldDto[];
  readonly onChange: (fields: readonly CustomFieldDto[]) => void;
}) {
  const update = (id: string, patch: Partial<Omit<CustomFieldDto, "id">>) => {
    onChange(fields.map((field) => (field.id === id ? { ...field, ...patch } : field)));
  };

  return (
    <div className="hero-edit-fields">
      {fields.map((field) => (
        <div className="hero-edit-field" key={field.id}>
          <input
            value={field.name}
            placeholder="Название"
            aria-label="Название поля"
            onChange={(event) => update(field.id, { name: event.target.value })}
          />
          <input
            value={field.value}
            placeholder="Значение"
            aria-label="Значение поля"
            onChange={(event) => update(field.id, { value: event.target.value })}
          />
          <button
            type="button"
            className="icon-button"
            aria-label="Удалить поле"
            onClick={() => onChange(fields.filter((item) => item.id !== field.id))}
          >
            <Icon name="close" size={13} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn"
        onClick={() => onChange([...fields, { id: newFieldId(), name: "", value: "" }])}
      >
        + Поле
      </button>
    </div>
  );
}

function PortraitUpload({
  portraitUrl,
  onUpload,
}: {
  readonly portraitUrl: string | null;
  readonly onUpload: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File) => {
    if (file.size > MAX_PORTRAIT_BYTES) return;
    const reader = new FileReader();
    reader.onload = () => onUpload(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="portrait-upload"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file !== undefined) readFile(file);
      }}
    >
      {portraitUrl !== null ? (
        <img className="portrait" src={portraitUrl} alt="Портрет" />
      ) : (
        <div className="portrait portrait-placeholder">
          <Icon name="edit" size={22} />
        </div>
      )}
      <div className="portrait-upload-actions">
        <button type="button" className="btn" onClick={() => inputRef.current?.click()}>
          Изображение
        </button>
        {portraitUrl !== null && (
          <button
            type="button"
            className="icon-button"
            aria-label="Убрать портрет"
            title="Убрать портрет"
            onClick={() => onUpload(null)}
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file !== undefined) readFile(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

export function HeroCard({ profile, onChange }: HeroCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CharacterProfileDto>(profile);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const [expanded, setExpanded] = useState(false);
  const description = profile.description;
  const isLong = description !== null && description.length > DESCRIPTION_CLAMP_LENGTH;
  const sizeModifier =
    profile.sizeModifier === null
      ? null
      : profile.sizeModifier > 0
        ? `+${profile.sizeModifier}`
        : String(profile.sizeModifier);

  const startEditing = () => {
    setDraft(profile);
    setEditing(true);
  };

  const save = () => {
    onChange({ ...draft, name: draft.name.trim() === "" ? profile.name : draft.name.trim() });
    setEditing(false);
  };

  if (editing) {
    return (
      <section className="hero is-editing">
        <div className="hero-portrait-column">
          <PortraitUpload
            portraitUrl={draft.portraitUrl}
            onUpload={(dataUrl) => setDraft({ ...draft, portraitUrl: dataUrl })}
          />
        </div>
        <div className="hero-info hero-edit">
          <label className="dice-field">
            <span>Имя</span>
            <input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </label>
          <div className="hero-edit-grid">
            <label className="dice-field">
              <span>Кампания</span>
              <input
                value={draft.campaign ?? ""}
                onChange={(event) => setDraft({ ...draft, campaign: event.target.value })}
              />
            </label>
            <label className="dice-field">
              <span>Игрок</span>
              <input
                value={draft.playerName ?? ""}
                onChange={(event) => setDraft({ ...draft, playerName: event.target.value })}
              />
            </label>
            <label className="dice-field">
              <span>Тех уровень</span>
              <input
                value={draft.techLevel ?? ""}
                onChange={(event) => setDraft({ ...draft, techLevel: event.target.value })}
              />
            </label>
          </div>
          <label className="dice-field">
            <span>Описание</span>
            <textarea
              className="hero-edit-description"
              value={draft.description ?? ""}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              rows={7}
            />
          </label>
          <CustomFieldsEditor
            fields={draft.customFields}
            onChange={(customFields) => setDraft({ ...draft, customFields })}
          />
          <div className="hero-edit-actions">
            <button type="button" className="btn-primary hero-save" onClick={save}>
              Сохранить
            </button>
            <button type="button" className="btn" onClick={() => setEditing(false)}>
              Отмена
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero">
      <Portrait portraitUrl={profile.portraitUrl} alt={`Портрет: ${profile.name}`} />
      <div className="hero-info">
        <div className="hero-title-row">
          <h1 className="hero-name">{profile.name}</h1>
          <button
            type="button"
            className="icon-button hero-edit-toggle"
            aria-label="Редактировать профиль"
            title="Редактировать профиль"
            onClick={startEditing}
          >
            <Icon name="edit" size={15} />
          </button>
        </div>
        <div className="hero-meta">
          {profile.campaign !== null && <span className="hero-meta-accent">{profile.campaign}</span>}
          {profile.techLevel !== null && <span>TL {profile.techLevel}</span>}
          {sizeModifier !== null && <span>SM {sizeModifier}</span>}
          {profile.playerName !== null && <span>{profile.playerName}</span>}
        </div>
        {profile.customFields.length > 0 && (
          <div className="hero-custom">
            {profile.customFields.map(
              (field) =>
                field.value.trim() !== "" && (
                  <span key={field.id} className="hero-custom-field">
                    {field.name.trim() !== "" && <b>{field.name}:</b>} {field.value}
                  </span>
                ),
            )}
          </div>
        )}
        {description !== null && (
          <>
            <p className={`hero-desc${!expanded && isLong ? " is-clamped" : ""}`}>{description}</p>
            {isLong && (
              <button type="button" className="hero-more" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Свернуть" : "Ещё…"}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
