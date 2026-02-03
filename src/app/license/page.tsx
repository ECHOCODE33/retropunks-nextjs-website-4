export default function LicensePage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-retro-orange text-4xl font-bold mb-12 text-center">License & Terms</h1>
        
        <div className="prose prose-invert max-w-none space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-retro-orange mb-4">NFT License Agreement</h2>
            <p className="leading-relaxed">
              This NFT License Agreement (&quot;Agreement&quot;) governs the rights and obligations associated with the ownership and use of RetroPunks NFTs. By purchasing, owning, or otherwise acquiring a RetroPunks NFT, you agree to be bound by these terms.
            </p>
          </section>

          <section>
            <h3 className="license-title">1. Ownership</h3>
            <p className="leading-relaxed mb-3">
              When you purchase a RetroPunks NFT, you own the underlying NFT completely. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The right to sell, trade, transfer, or otherwise dispose of the NFT</li>
              <li>The right to use the NFT as collateral for loans or other financial instruments</li>
              <li>Personal, non-commercial use of the associated artwork</li>
            </ul>
          </section>

          <section>
            <h3 className="license-title">2. Commercial Rights</h3>
            <p className="leading-relaxed mb-3">
              Subject to your continued ownership of the NFT, you are granted a worldwide, non-exclusive, royalty-free license to use, copy, and display the artwork for commercial purposes, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Creating and selling merchandise (t-shirts, mugs, posters, etc.)</li>
              <li>Using the artwork in commercial projects, products, or services</li>
              <li>Licensing the artwork to third parties</li>
              <li>Creating derivative works based on the artwork</li>
            </ul>
            <p className="leading-relaxed mt-3">
              <strong>Revenue Cap:</strong> For any single commercial use that generates over $100,000 USD in revenue, you must notify the creator at echomatrix.eth and negotiate a separate licensing agreement.
            </p>
          </section>

          <section>
            <h3 className="license-title">3. Restrictions</h3>
            <p className="leading-relaxed mb-3">You may NOT:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the artwork in connection with images, videos, or other forms of media that depict hatred, intolerance, violence, cruelty, or anything that could reasonably be found to constitute hate speech</li>
              <li>Claim trademark, copyright, or other intellectual property rights in the artwork</li>
              <li>Attempt to trademark or copyright the artwork</li>
              <li>Use the artwork to advertise, market, or sell third-party products without disclosure of NFT ownership</li>
              <li>Falsely represent that you created the original artwork</li>
            </ul>
          </section>

          <section>
            <h3 className="license-title">4. Customization Features</h3>
            <p className="leading-relaxed">
              RetroPunks NFTs include on-chain customization features allowing owners to modify the background, name, and bio of their NFTs. These customizations:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Are stored permanently on the blockchain</li>
              <li>Are subject to character limits (32 characters for names, 160 for bios)</li>
              <li>Must not contain offensive, hateful, or illegal content</li>
              <li>May not be available for special 1-of-1 NFTs</li>
            </ul>
          </section>

          <section>
            <h3 className="license-title">5. Transfer of Rights</h3>
            <p className="leading-relaxed">
              When you sell, trade, donate, give away, transfer, or otherwise dispose of your NFT, all rights granted to you under this Agreement transfer to the new owner. You retain no rights to the artwork after the transfer.
            </p>
          </section>

          <section>
            <h3 className="license-title">6. Creator Rights</h3>
            <p className="leading-relaxed">
              The creator (&quot;ECHO&quot;) retains all rights to the RetroPunks brand name, logo, and the underlying generative algorithm. The creator reserves the right to use the RetroPunks artwork for promotional purposes, including but not limited to marketing materials, social media, and exhibitions.
            </p>
          </section>

          <section>
            <h3 className="license-title">7. Smart Contract and Blockchain</h3>
            <p className="leading-relaxed">
              RetroPunks NFTs are generated and stored on the Ethereum blockchain. The smart contract code is immutable and cannot be modified after deployment. All artwork is rendered on-chain as SVG, ensuring permanence and decentralization.
            </p>
          </section>

          <section>
            <h3 className="license-title">8. Disclaimer of Warranties</h3>
            <p className="leading-relaxed">
              THE NFTS ARE PROVIDED &quot;AS IS&quot; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. THE CREATOR MAKES NO REPRESENTATIONS OR WARRANTIES REGARDING THE NFTS, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
          </section>

          <section>
            <h3 className="license-title">9. Limitation of Liability</h3>
            <p className="leading-relaxed">
              IN NO EVENT SHALL THE CREATOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO THIS AGREEMENT OR THE NFTS, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE.
            </p>
          </section>

          <section>
            <h3 className="license-title">10. Governing Law</h3>
            <p className="leading-relaxed">
              This Agreement shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h3 className="license-title">11. Changes to Terms</h3>
            <p className="leading-relaxed">
              The creator reserves the right to modify these terms at any time. Material changes will be communicated via official channels. Your continued ownership of a RetroPunks NFT after such modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="border-t-2 border-retro-light pt-8 mt-12">
            <p className="text-sm text-gray-400">
              <strong>Last Updated:</strong> January 2026
            </p>
            <p className="text-sm text-gray-400 mt-2">
              <strong>Contact:</strong> For questions regarding this license, please contact echo.matrix001@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}