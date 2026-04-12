import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit2, Trash2, Target, TrendingUp } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Goals() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    targetAmount: 0,
    type: "saving",
    deadline: "",
  });

  const [goals, setGoals] = React.useState<any[]>([
    {
      id: 1,
      name: "Emergency Fund",
      description: "Save 6 months of expenses",
      targetAmount: 50000000,
      currentAmount: 25000000,
      type: "emergency",
      deadline: "2025-12-31",
      progress: 50,
    },
    {
      id: 2,
      name: "Vacation",
      description: "Trip to Bali",
      targetAmount: 10000000,
      currentAmount: 3000000,
      type: "saving",
      deadline: "2025-06-30",
      progress: 30,
    },
  ]);

  const handleOpenModal = (goal?: any) => {
    if (goal) {
      setEditingId(goal.id);
      setFormData({
        name: goal.name,
        description: goal.description,
        targetAmount: goal.targetAmount,
        type: goal.type,
        deadline: goal.deadline,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        targetAmount: 0,
        type: "saving",
        deadline: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setGoals(
        goals.map((g) =>
          g.id === editingId
            ? {
                ...g,
                ...formData,
                progress: Math.round(
                  (g.currentAmount / formData.targetAmount) * 100,
                ),
              }
            : g,
        ),
      );
    } else {
      setGoals([
        ...goals,
        {
          id: Math.max(...goals.map((g) => g.id), 0) + 1,
          ...formData,
          currentAmount: 0,
          progress: 0,
        },
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress =
    totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient">Goals</h1>
            <p className="text-muted-foreground mt-2">
              Track your financial goals and aspirations
            </p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <Plus className="w-4 h-4" />
            New Goal
          </Button>
        </div>

        {/* Overall Progress */}
        {goals.length > 0 && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Overall Progress
                </p>
                <p className="text-2xl font-bold text-gradient">
                  {overallProgress}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary/50" />
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(totalCurrent)} / {formatCurrency(totalTarget)}
              </span>
              <span className="text-muted-foreground">
                {goals.length} {goals.length === 1 ? "goal" : "goals"}
              </span>
            </div>
          </GlassCard>
        )}

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No goals yet. Create your first goal!
            </p>
            <Button onClick={() => handleOpenModal()}>Create Goal</Button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <GlassCard
                key={goal.id}
                className="p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{goal.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {goal.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(goal)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(goal.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      {goal.progress}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(goal.currentAmount)} /{" "}
                      {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Goal Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm font-medium capitalize">
                      {goal.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className="text-sm font-medium">
                      {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Goal" : "Create New Goal"}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Goal Name</label>
              <Input
                placeholder="e.g., Emergency Fund"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="e.g., Save 6 months of expenses"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Target Amount</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.targetAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border/30 text-foreground"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="saving">Saving Goal</option>
                  <option value="debt">Debt Payoff</option>
                  <option value="investment">Investment Goal</option>
                  <option value="emergency">Emergency Fund</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Deadline</label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
