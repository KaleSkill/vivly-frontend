import React from 'react'
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Footer from './components/Footer'
import ViblyNavigation from '@/components/ui/vivly-navigation'

const SizeGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <ViblyNavigation />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Size Guide</h1>
            <p className="text-lg text-muted-foreground">
              Find your perfect fit with our comprehensive size guide
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            
            {/* Men's Clothing Size Guide */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Men's Clothing</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-border rounded-lg">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left py-3 px-4 border border-border font-semibold">Size</th>
                      <th className="text-left py-3 px-4 border border-border font-semibold">Chest (inches)</th>
                      <th className="text-left py-3 px-4 border border-border font-semibold">Waist (inches)</th>
                      <th className="text-left py-3 px-4 border border-border font-semibold">Length (inches)</th>
                      <th className="text-left py-3 px-4 border border-border font-semibold">Sleeve (inches)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">XS</td>
                      <td className="py-3 px-4 border border-border">34-36</td>
                      <td className="py-3 px-4 border border-border">28-30</td>
                      <td className="py-3 px-4 border border-border">26</td>
                      <td className="py-3 px-4 border border-border">32</td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">S</td>
                      <td className="py-3 px-4 border border-border">36-38</td>
                      <td className="py-3 px-4 border border-border">30-32</td>
                      <td className="py-3 px-4 border border-border">27</td>
                      <td className="py-3 px-4 border border-border">33</td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">M</td>
                      <td className="py-3 px-4 border border-border">38-40</td>
                      <td className="py-3 px-4 border border-border">32-34</td>
                      <td className="py-3 px-4 border border-border">28</td>
                      <td className="py-3 px-4 border border-border">34</td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">L</td>
                      <td className="py-3 px-4 border border-border">40-42</td>
                      <td className="py-3 px-4 border border-border">34-36</td>
                      <td className="py-3 px-4 border border-border">29</td>
                      <td className="py-3 px-4 border border-border">35</td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">XL</td>
                      <td className="py-3 px-4 border border-border">42-44</td>
                      <td className="py-3 px-4 border border-border">36-38</td>
                      <td className="py-3 px-4 border border-border">30</td>
                      <td className="py-3 px-4 border border-border">36</td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">XXL</td>
                      <td className="py-3 px-4 border border-border">44-46</td>
                      <td className="py-3 px-4 border border-border">38-40</td>
                      <td className="py-3 px-4 border border-border">31</td>
                      <td className="py-3 px-4 border border-border">37</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground mt-4">Model is 6'0" and wearing size M</p>
            </section>

            {/* Women's Clothing Size Guide */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">Women's Clothing</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-border rounded-lg">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left py-3 px-4 border border-border font-semibold">Size</th>
                      <th className="text-left py-3 px-4 border border-border font-semibold">Bust (inches)</th>
                      <th className="text-left py-3 px-4 border border-border font-semibold">Waist (inches)</th>
                      <th className="text-left py-3 px-4 border border-border font-semibold">Hips (inches)</th>
                      <th className="text-left py-3 px-4 border border-border font-semibold">Length (inches)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">XS</td>
                      <td className="py-3 px-4 border border-border">32-34</td>
                      <td className="py-3 px-4 border border-border">24-26</td>
                      <td className="py-3 px-4 border border-border">34-36</td>
                      <td className="py-3 px-4 border border-border">24</td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">S</td>
                      <td className="py-3 px-4 border border-border">34-36</td>
                      <td className="py-3 px-4 border border-border">26-28</td>
                      <td className="py-3 px-4 border border-border">36-38</td>
                      <td className="py-3 px-4 border border-border">25</td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">M</td>
                      <td className="py-3 px-4 border border-border">36-38</td>
                      <td className="py-3 px-4 border border-border">28-30</td>
                      <td className="py-3 px-4 border border-border">38-40</td>
                      <td className="py-3 px-4 border border-border">26</td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">L</td>
                      <td className="py-3 px-4 border border-border">38-40</td>
                      <td className="py-3 px-4 border border-border">30-32</td>
                      <td className="py-3 px-4 border border-border">40-42</td>
                      <td className="py-3 px-4 border border-border">27</td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">XL</td>
                      <td className="py-3 px-4 border border-border">40-42</td>
                      <td className="py-3 px-4 border border-border">32-34</td>
                      <td className="py-3 px-4 border border-border">42-44</td>
                      <td className="py-3 px-4 border border-border">28</td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">XXL</td>
                      <td className="py-3 px-4 border border-border">42-44</td>
                      <td className="py-3 px-4 border border-border">34-36</td>
                      <td className="py-3 px-4 border border-border">43-46</td>
                      <td className="py-3 px-4 border border-border">29</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground mt-4">Model is 5'6" and wearing size M</p>
            </section>

            {/* How to Measure */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">How to Measure</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">For Men:</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</p>
                    <p><strong>Waist:</strong> Measure around your natural waistline, just above your hip bones.</p>
                    <p><strong>Length:</strong> Measure from the highest point of the shoulder to the desired garment length.</p>
                    <p><strong>Sleeve:</strong> Measure from the shoulder seam to the wrist bone.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">For Women:</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Bust:</strong> Measure around the fullest part of your bust, keeping the tape horizontal.</p>
                    <p><strong>Waist:</strong> Measure around your natural waistline, keeping the tape comfortably loose.</p>
                    <p><strong>Hips:</strong> Measure around the fullest part of your hips, typically 7-9 inches below your waist.</p>
                    <p><strong>Length:</strong> Measure from the highest point of the shoulder to the desired garment length.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Measurement Tips */}
            <section>
              <div className="bg-muted/50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">📏 Measurement Tips</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Use a soft measuring tape for accurate measurements</li>
                  <li>• Measure over thin clothing or bare skin for best results</li>
                  <li>• Keep the tape measure snug but not tight</li>
                  <li>• Have someone help you for hard-to-reach measurements</li>
                  <li>• Measure in a relaxed stance with natural posture</li>
                  <li>• Take measurements twice to ensure accuracy</li>
                  <li>• If between sizes, we recommend sizing up for comfort</li>
                </ul>
              </div>
            </section>

            {/* International Size Comparison */}
            <section>
              <h2 className="text-2xl font-semibold mb-6">International Size Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-border rounded-lg">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left py-3 px-4 border border-border font-semibold">US/UK</th>
                      <th className="text-left py-3 px-4 border border-border font-semibold">Europe</th>
                      <th className="text-left py-3 px-4 border border-border font-semibold">India</th>
                      <th className="text-left py-3 px-4 border border-border font-semibold">Australia</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">XS</td>
                      <td className="py-3 px-4 border border-border">36</td>
                      <td className="py-3 px-4 border border-border">32</td>
                      <td className="py-3 px-4 border border-border">8</td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">S</td>
                      <td className="py-3 px-4 border border-border">38</td>
                      <td className="py-3 px-4 border border-border">34</td>
                      <td className="py-3 px-4 border border-border">10</td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">M</td>
                      <td className="py-3 px-4 border border-border">40</td>
                      <td className="py-3 px-4 border border-border">36</td>
                      <td className="py-3 px-4 border border-border">12</td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">L</td>
                      <td className="py-3 px-4 border border-border">42</td>
                      <td className="py-3 px-4 border border-border">38</td>
                      <td className="py-3 px-4 border border-border">14</td>
                    </tr>
                    <tr className="hover:bg-muted/20">
                      <td className="py-3 px-4 border border-border font-medium">XL</td>
                      <td className="py-3 px-4 border border-border">44</td>
                      <td className="py-3 px-4 border border-border">40</td>
                      <td className="py-3 px-4 border border-border">16</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

          </div>

          {/* Footer Note */}
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            <p>Need help finding your size? Contact our customer service team at <strong>mirajhasanmd6@gmail.com</strong> or call <strong>+91-6287915088</strong></p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default SizeGuide
