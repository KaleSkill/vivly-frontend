import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SizeSelector({ sizes, selectedSize, onSizeSelect }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Size</label>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto p-0 text-sm underline" data-testid="button-size-guide">
              Size Guide
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-size-guide">
            <DialogHeader>
              <DialogTitle>Size Guide</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Size</th>
                      <th className="text-left py-2 px-2">Chest (in)</th>
                      <th className="text-left py-2 px-2">Length (in)</th>
                      <th className="text-left py-2 px-2">Sleeve (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-2">XS</td>
                      <td className="py-2 px-2">34-36</td>
                      <td className="py-2 px-2">26</td>
                      <td className="py-2 px-2">32</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-2">S</td>
                      <td className="py-2 px-2">36-38</td>
                      <td className="py-2 px-2">27</td>
                      <td className="py-2 px-2">33</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-2">M</td>
                      <td className="py-2 px-2">38-40</td>
                      <td className="py-2 px-2">28</td>
                      <td className="py-2 px-2">34</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-2">L</td>
                      <td className="py-2 px-2">40-42</td>
                      <td className="py-2 px-2">29</td>
                      <td className="py-2 px-2">35</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-2">XL</td>
                      <td className="py-2 px-2">42-44</td>
                      <td className="py-2 px-2">30</td>
                      <td className="py-2 px-2">36</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2">XXL</td>
                      <td className="py-2 px-2">44-46</td>
                      <td className="py-2 px-2">31</td>
                      <td className="py-2 px-2">37</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground">Model is 6'0" and wearing size M</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex gap-2 flex-wrap">
        {sizes.map((size) => (
          <Button
            key={size}
            variant={selectedSize === size ? "default" : "outline"}
            onClick={() => onSizeSelect(size)}
            className="h-9 px-5 rounded-full text-sm"
            data-testid={`button-size-${size.toLowerCase()}`}
          >
            {size}
          </Button>
        ))}
      </div>
    </div>
  );
}
