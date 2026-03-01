import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Lightning } from "@phosphor-icons/react";
import { GlowOrb } from "@/components/shared/GlowOrb";
import { StepIndustry } from "@/components/org-builder/StepIndustry";
import { StepStructure } from "@/components/org-builder/StepStructure";
import { StepRoles } from "@/components/org-builder/StepRoles";
import { StepPolicy } from "@/components/org-builder/StepPolicy";
import { OrgPreviewCanvas } from "@/components/org-builder/OrgPreviewCanvas";
import { useUIStore, useScenarioStore } from "@/store";
import { getOrgTemplate } from "@/lib/org-builder-templates";
import { buildCustomScenario } from "@/lib/scenario-from-builder";
import type { IndustryId } from "@/types/industry";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Industry", description: "Name your org and pick an industry" },
  { label: "Structure", description: "Add departments" },
  { label: "Roles", description: "Add roles to departments" },
  { label: "Policy", description: "Define your approval policy" },
];

export function OrgBuilderScreen() {
  const { navigateTo } = useUIStore();
  const { loadScenarioForDualRun } = useScenarioStore();

  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState("");
  const [industryId, setIndustryId] = useState<IndustryId | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});
  const [threshold, setThreshold] = useState(1);
  const [expiryHours, setExpiryHours] = useState(4);
  const [delegationAllowed, setDelegationAllowed] = useState(true);

  const handleIndustryChange = (id: IndustryId) => {
    setIndustryId(id);
    const template = getOrgTemplate(id);
    setDepartments(template.departments);
    setRoles(template.roles);
    setThreshold(template.defaultPolicy.threshold);
    setExpiryHours(template.defaultPolicy.expiryHours);
    setDelegationAllowed(template.defaultPolicy.delegationAllowed);
  };

  const totalRoles = useMemo(() => {
    return Object.values(roles).reduce((sum, arr) => sum + arr.length, 0);
  }, [roles]);

  const canAdvance = () => {
    switch (step) {
      case 0: return orgName.trim().length > 0 && industryId !== null;
      case 1: return departments.length > 0;
      case 2: return totalRoles >= 2;
      case 3: return true;
      default: return false;
    }
  };

  const handleRunSimulation = () => {
    if (!industryId) return;
    const scenario = buildCustomScenario({
      orgName: orgName.trim(),
      industryId,
      departments,
      roles,
      policy: { threshold, expiryHours, delegationAllowed },
    });
    loadScenarioForDualRun(scenario);
    navigateTo("simulation");
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg overflow-hidden">
      <GlowOrb color="#3B82F6" size={500} className="top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
      <GlowOrb color="#8B5CF6" size={300} className="bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 opacity-[0.04]" />

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigateTo("industry-picker")}
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            {step > 0 ? "Back" : "Choose Industry"}
          </button>

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                {i > 0 && <div className="w-6 h-px bg-border" />}
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full text-[0.55rem] font-bold flex items-center justify-center transition-all",
                      i < step
                        ? "bg-success text-white"
                        : i === step
                          ? "bg-primary text-white"
                          : "bg-surface border border-border text-text-subtle"
                    )}
                  >
                    {i < step ? "\u2713" : i + 1}
                  </div>
                  <span className={cn(
                    "text-[0.65rem] font-medium hidden md:inline",
                    i === step ? "text-text" : "text-text-subtle"
                  )}>
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="w-[100px]" /> {/* spacer for centering */}
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Wizard panel */}
          <div className="w-full md:w-1/2 overflow-y-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h2 className="font-heading text-lg font-bold text-text">
                {STEPS[step]?.label}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                {STEPS[step]?.description}
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step === 0 && (
                  <StepIndustry
                    orgName={orgName}
                    industryId={industryId}
                    onOrgNameChange={setOrgName}
                    onIndustryChange={handleIndustryChange}
                  />
                )}
                {step === 1 && (
                  <StepStructure
                    departments={departments}
                    onDepartmentsChange={setDepartments}
                  />
                )}
                {step === 2 && (
                  <StepRoles
                    departments={departments}
                    roles={roles}
                    onRolesChange={setRoles}
                  />
                )}
                {step === 3 && (
                  <StepPolicy
                    totalRoles={totalRoles}
                    threshold={threshold}
                    expiryHours={expiryHours}
                    delegationAllowed={delegationAllowed}
                    onThresholdChange={setThreshold}
                    onExpiryChange={setExpiryHours}
                    onDelegationChange={setDelegationAllowed}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-border/40">
              <div />
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canAdvance()}
                  className={cn(
                    "inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold rounded-[10px] transition-all cursor-pointer",
                    "bg-primary text-white hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  Next
                  <ArrowRight size={14} weight="bold" />
                </button>
              ) : (
                <button
                  onClick={handleRunSimulation}
                  disabled={totalRoles < 2}
                  className={cn(
                    "inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold rounded-[10px] transition-all cursor-pointer",
                    "bg-primary text-white hover:bg-primary-hover hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  <Lightning size={14} weight="fill" />
                  Run Simulation
                </button>
              )}
            </div>
          </div>

          {/* Preview panel (desktop only) */}
          <div className="hidden md:block w-1/2 border-l border-border/40 bg-bg/50">
            <div className="p-4 border-b border-border/30">
              <span className="text-[0.65rem] font-semibold text-text-muted uppercase tracking-wider">
                Org Chart Preview
              </span>
            </div>
            <OrgPreviewCanvas
              orgName={orgName}
              departments={departments}
              roles={roles}
              industryId={industryId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
