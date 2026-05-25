"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  LABS_AI_TOOL_OPTIONS,
  LABS_AVAILABILITY_OPTIONS,
  LABS_GITHUB_COMFORT_OPTIONS,
  LABS_INTEREST_OPTIONS,
  LABS_ROLE_OPTIONS,
  type LabsOption,
  type LabsProfileFormValues,
} from "@/lib/labs-state";

type BuilderProfileWizardProps = {
  action: (formData: FormData) => void | Promise<void>;
  githubUsername: string | null;
  initialValues: LabsProfileFormValues;
};

type WizardStep = 0 | 1 | 2;
type MultiSelectKey = "interests" | "aiTools" | "preferredRole";

export function BuilderProfileWizard({
  action,
  githubUsername,
  initialValues,
}: BuilderProfileWizardProps) {
  const [step, setStep] = useState<WizardStep>(0);
  const [message, setMessage] = useState("");
  const [values, setValues] = useState<LabsProfileFormValues>(initialValues);

  const progressLabel = useMemo(() => `Step ${step + 1} of 3`, [step]);

  function updateValue<Key extends keyof LabsProfileFormValues>(
    key: Key,
    value: LabsProfileFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function toggleListValue(key: MultiSelectKey, value: string) {
    if (
      key === "preferredRole" &&
      !values.preferredRole.includes(value) &&
      values.preferredRole.length >= 2
    ) {
      setMessage("Choose up to two preferred roles.");
      return;
    }

    setValues((current) => {
      const selected = new Set(current[key]);

      if (selected.has(value)) {
        selected.delete(value);
      } else {
        selected.add(value);
      }

      if (key === "aiTools" && value === "none" && selected.has("none")) {
        return { ...current, [key]: ["none"] };
      }

      if (key === "aiTools" && value !== "none") {
        selected.delete("none");
      }

      return { ...current, [key]: Array.from(selected) };
    });
    setMessage("");
  }

  function goNext() {
    const error = validateStep(step, values);

    if (error) {
      setMessage(error);
      return;
    }

    setStep((current) => Math.min(current + 1, 2) as WizardStep);
    setMessage("");
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0) as WizardStep);
    setMessage("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const firstInvalidStep = ([0, 1, 2] as const).find(
      (wizardStep) => validateStep(wizardStep, values) !== null,
    );

    if (firstInvalidStep !== undefined) {
      event.preventDefault();
      setStep(firstInvalidStep);
      setMessage(validateStep(firstInvalidStep, values) ?? "");
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-normal text-accent">
            {progressLabel}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            Join
          </h1>
        </div>
        {githubUsername ? (
          <span className="rounded-md border border-border bg-card-soft px-2.5 py-1 text-xs font-semibold text-muted">
            @{githubUsername}
          </span>
        ) : null}
      </div>

      <form action={action} onSubmit={handleSubmit} className="mt-6">
        <HiddenProfileFields values={values} />

        {step === 0 ? (
          <BasicsStep values={values} updateValue={updateValue} />
        ) : null}

        {step === 1 ? (
          <InterestsStep
            values={values}
            updateValue={updateValue}
            toggleListValue={toggleListValue}
          />
        ) : null}

        {step === 2 ? (
          <WorkflowStep
            values={values}
            updateValue={updateValue}
            toggleListValue={toggleListValue}
          />
        ) : null}

        {message ? (
          <p className="mt-4 rounded-md border border-warm bg-warm-soft px-3 py-2 text-sm font-medium text-foreground">
            {message}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="min-h-11 rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-card-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={goNext}
              className="min-h-11 rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Next
            </button>
          ) : (
            <SubmitButton />
          )}
        </div>
      </form>
    </section>
  );
}

function BasicsStep({
  values,
  updateValue,
}: {
  values: LabsProfileFormValues;
  updateValue: <Key extends keyof LabsProfileFormValues>(
    key: Key,
    value: LabsProfileFormValues[Key],
  ) => void;
}) {
  return (
    <div className="grid gap-4">
      <StepHeader
        title="Who are you?"
        description="Help us recognize you during review."
      />
      <TextField
        id="preferredName"
        label="Preferred name"
        value={values.preferredName}
        onChange={(value) => updateValue("preferredName", value)}
      />
      <TextField
        id="contactEmail"
        label="Contact email"
        type="email"
        value={values.contactEmail}
        onChange={(value) => updateValue("contactEmail", value)}
      />
      <TextField
        id="affiliation"
        label="School or community"
        optional
        value={values.affiliation}
        onChange={(value) => updateValue("affiliation", value)}
      />
      <TextField
        id="referrer"
        label="Invite code or referrer"
        optional
        value={values.referrer}
        onChange={(value) => updateValue("referrer", value)}
      />
    </div>
  );
}

function InterestsStep({
  values,
  updateValue,
  toggleListValue,
}: {
  values: LabsProfileFormValues;
  updateValue: <Key extends keyof LabsProfileFormValues>(
    key: Key,
    value: LabsProfileFormValues[Key],
  ) => void;
  toggleListValue: (
    key: MultiSelectKey,
    value: string,
  ) => void;
}) {
  return (
    <div className="grid gap-4">
      <StepHeader
        title="What interests you?"
        description="Pick the kinds of work you want to try."
      />
      <ChipGroup
        label="Interests"
        options={LABS_INTEREST_OPTIONS}
        selected={values.interests}
        onToggle={(value) => toggleListValue("interests", value)}
      />
      <label className="grid gap-2 text-sm font-semibold text-foreground">
        Anything you want to build or learn?
        <textarea
          value={values.buildGoal}
          maxLength={240}
          onChange={(event) => updateValue("buildGoal", event.target.value)}
          className="min-h-28 rounded-md border border-border bg-surface px-3 py-3 text-sm font-normal leading-6 text-foreground outline-none transition placeholder:text-muted focus:border-accent"
          placeholder="A short note is enough."
        />
      </label>
    </div>
  );
}

function WorkflowStep({
  values,
  updateValue,
  toggleListValue,
}: {
  values: LabsProfileFormValues;
  updateValue: <Key extends keyof LabsProfileFormValues>(
    key: Key,
    value: LabsProfileFormValues[Key],
  ) => void;
  toggleListValue: (
    key: MultiSelectKey,
    value: string,
  ) => void;
}) {
  return (
    <div className="grid gap-5">
      <StepHeader
        title="Workflow fit"
        description="This helps us choose a good first task."
      />
      <SegmentedGroup
        label="GitHub comfort"
        options={LABS_GITHUB_COMFORT_OPTIONS}
        selected={values.githubComfort}
        onSelect={(value) => updateValue("githubComfort", value)}
      />
      <ChipGroup
        label="AI tools"
        options={LABS_AI_TOOL_OPTIONS}
        selected={values.aiTools}
        onToggle={(value) => toggleListValue("aiTools", value)}
      />
      <SegmentedGroup
        label="Availability"
        options={LABS_AVAILABILITY_OPTIONS}
        selected={values.availability}
        onSelect={(value) => updateValue("availability", value)}
      />
      <ChipGroup
        label="Preferred roles"
        hint="Choose up to 2."
        options={LABS_ROLE_OPTIONS}
        selected={values.preferredRole}
        onToggle={(value) => toggleListValue("preferredRole", value)}
      />
    </div>
  );
}

function HiddenProfileFields({ values }: { values: LabsProfileFormValues }) {
  return (
    <>
      <input type="hidden" name="preferredName" value={values.preferredName} />
      <input type="hidden" name="contactEmail" value={values.contactEmail} />
      <input type="hidden" name="affiliation" value={values.affiliation} />
      <input type="hidden" name="referrer" value={values.referrer} />
      {values.interests.map((interest) => (
        <input key={interest} type="hidden" name="interests" value={interest} />
      ))}
      <input type="hidden" name="buildGoal" value={values.buildGoal} />
      <input
        type="hidden"
        name="githubComfort"
        value={values.githubComfort}
      />
      {(values.aiTools.length ? values.aiTools : ["none"]).map((tool) => (
        <input key={tool} type="hidden" name="aiTools" value={tool} />
      ))}
      <input type="hidden" name="availability" value={values.availability} />
      {values.preferredRole.map((role) => (
        <input key={role} type="hidden" name="preferredRole" value={role} />
      ))}
    </>
  );
}

function StepHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}

function TextField({
  id,
  label,
  optional = false,
  type = "text",
  value,
  onChange,
}: {
  id: string;
  label: string;
  optional?: boolean;
  type?: "email" | "text";
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="grid gap-2 text-sm font-semibold text-foreground"
    >
      <span>
        {label}
        {optional ? (
          <span className="font-normal text-muted"> optional</span>
        ) : null}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-md border border-border bg-surface px-3 text-sm font-normal text-foreground outline-none transition placeholder:text-muted focus:border-accent"
      />
    </label>
  );
}

function ChipGroup({
  label,
  hint,
  options,
  selected,
  onToggle,
}: {
  label: string;
  hint?: string;
  options: readonly LabsOption[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-foreground">
        {label}
        {hint ? (
          <span className="ml-1 font-normal text-muted">{hint}</span>
        ) : null}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(option.value)}
              className={
                isSelected
                  ? "min-h-10 rounded-md border border-accent bg-accent-soft px-3 text-sm font-semibold text-foreground"
                  : "min-h-10 rounded-md border border-border bg-surface px-3 text-sm font-semibold text-muted transition hover:bg-card-soft hover:text-foreground"
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function SegmentedGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: readonly LabsOption[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-foreground">{label}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {options.map((option) => {
          const isSelected = selected === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(option.value)}
              className={
                isSelected
                  ? "min-h-11 rounded-md border border-accent bg-accent-soft px-3 text-sm font-semibold text-foreground"
                  : "min-h-11 rounded-md border border-border bg-surface px-3 text-sm font-semibold text-muted transition hover:bg-card-soft hover:text-foreground"
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Sending" : "Send for review"}
    </button>
  );
}

function validateStep(step: WizardStep, values: LabsProfileFormValues) {
  if (step === 0) {
    if (!values.preferredName.trim()) {
      return "Add your preferred name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail.trim())) {
      return "Add a valid contact email.";
    }
  }

  if (step === 1 && values.interests.length === 0) {
    return "Pick at least one interest.";
  }

  if (step === 2) {
    if (!values.githubComfort) {
      return "Choose your GitHub comfort level.";
    }

    if (!values.availability) {
      return "Choose your summer availability.";
    }

    if (values.preferredRole.length === 0) {
      return "Choose at least one preferred role.";
    }

    if (values.preferredRole.length > 2) {
      return "Choose up to two preferred roles.";
    }
  }

  return null;
}
