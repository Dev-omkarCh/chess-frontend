import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog"

export function EditProfileDialog({ isOpen, onOpenChange }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 bg-card border-border rounded-[2.5rem] p-8">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-black tracking-tight">Edit Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your public persona. Changes are reflected instantly across Nexus AI.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-5">
          {/* Grid Layout for compact fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
              <input className="w-full bg-background border border-border rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" defaultValue="Alex River" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Username</label>
              <input className="w-full bg-background border border-border rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" defaultValue="Grandmaster_OKLCH" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Bio</label>
            <textarea 
               className="w-full bg-background border border-border rounded-2xl py-3 px-4 h-24 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
               defaultValue="Obsessed with the Sicilian Defense. Designing pixels by day, taking kings by night."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Location</label>
            <input className="w-full bg-background border border-border rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" defaultValue="Stockholm, Sweden" />
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <button className="flex-1 py-3.5 rounded-2xl font-bold bg-muted text-muted-foreground hover:bg-muted/80 transition-all">
            Cancel
          </button>
          <button className="flex-1 py-3.5 rounded-2xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
            Save Changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}