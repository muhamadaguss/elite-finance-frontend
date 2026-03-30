import * as React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Search, Plus, Filter, ArrowUpRight, ArrowDownLeft, Trash2, Edit2, LinkIcon } from "lucide-react";
import {
  useGetTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useGetCategories,
  useGetAssets,
  getGetTransactionsQueryKey,
  getGetMonthlySummaryQueryKey,
  getGetMonthlyTrendQueryKey,
  getGetAssetsQueryKey
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { TransactionType, CreateTransactionInput } from "@/lib/api-client";

export default function Transactions() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");

  // Filter States
  const [filterType, setFilterType] = React.useState<string>("all");
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [filterMonth, setFilterMonth] = React.useState<string>("");

  const { data, isLoading } = useGetTransactions({
    search: search || undefined,
    type: filterType !== "all" ? (filterType as any) : undefined,
    categoryId: filterCategory !== "all" ? parseInt(filterCategory) : undefined,
    month: filterMonth || undefined
  });
  const { data: categories } = useGetCategories();
  const { data: assets } = useGetAssets();

  // Clear filters
  const handleClearFilters = () => {
    setFilterType("all");
    setFilterCategory("all");
    setFilterMonth("");
  };

  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const [formData, setFormData] = React.useState<CreateTransactionInput & { assetId?: number | null }>({
    date: new Date().toISOString().split('T')[0],
    description: "",
    amount: 0,
    type: "expense",
    categoryId: null,
    assetId: null
  });

  const handleOpenModal = (tx?: any) => {
    if (tx) {
      setEditingId(tx.id);
      setFormData({
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        type: tx.type as TransactionType,
        categoryId: tx.categoryId,
        assetId: tx.assetId ?? null,
      });
    } else {
      setEditingId(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: "",
        amount: 0,
        type: "expense",
        categoryId: null,
        assetId: null
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTx.mutateAsync({ id: editingId, data: formData });
      } else {
        await createTx.mutateAsync({ data: formData });
      }
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetMonthlySummaryQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetMonthlyTrendQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAssetsQueryKey() });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      await deleteTx.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey() });
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1">Manage and track all your financial movements.</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="sm:w-auto w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Transaction
          </Button>
        </div>

        <GlassCard className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Input
              icon={<Search className="w-4 h-4" />}
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="sm:w-auto w-full relative">
                  <Filter className="w-4 h-4 mr-2" /> Filters
                  {(filterType !== "all" || filterCategory !== "all" || filterMonth) && (
                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filter Transactions</h4>
                    <p className="text-sm text-muted-foreground">Select criteria to filter your transactions list.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories?.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            <span className="flex items-center gap-2">
                              <span>{c.icon}</span> {c.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Month</label>
                    <Input
                      type="month"
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                    />
                  </div>

                  <Button variant="ghost" onClick={handleClearFilters} className="w-full mt-2">
                    Clear Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-t-xl">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Asset</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 rounded-tr-xl font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                ) : data?.transactions.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No transactions found.</td></tr>
                ) : (
                  data?.transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shadow-inner",
                            tx.type === 'income' ? "bg-success/10 text-success" :
                              tx.type === 'expense' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                          )}>
                            {tx.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          {tx.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tx.categoryName ? (
                          <Badge variant="glass">{tx.categoryIcon} {tx.categoryName}</Badge>
                        ) : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        {(tx as any).assetName ? (
                          <Badge variant="glass"><LinkIcon className="w-3 h-3 mr-1" />{(tx as any).assetName}</Badge>
                        ) : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="px-6 py-4 font-bold">
                        <span className={cn(
                          tx.type === 'income' ? "text-success" : tx.type === 'expense' ? "text-foreground" : "text-primary"
                        )}>
                          {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenModal(tx)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20 hover:text-destructive" onClick={() => handleDelete(tx.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Transaction" : "Add Transaction"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <select
                className="flex h-12 w-full rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Date</label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <Input
              placeholder="E.g. Groceries at Whole Foods"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <select
                className="flex h-12 w-full rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={formData.categoryId || ""}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value) : null })}
              >
                <option value="">None</option>
                {categories?.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Linked Asset</label>
            <select
              className="flex h-12 w-full rounded-xl border border-border bg-muted/50 px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={formData.assetId || ""}
              onChange={(e) => setFormData({ ...formData, assetId: e.target.value ? parseInt(e.target.value) : null })}
            >
              <option value="">None</option>
              {assets?.map((a: any) => (
                <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Link to an asset to auto-update its value</p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createTx.isPending || updateTx.isPending}>Save Transaction</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
