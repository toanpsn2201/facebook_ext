import SwiftUI

struct ContentView: View {
    @State private var reloadTrigger = 0
    @State private var canGoBack = false
    @State private var canGoForward = false
    @State private var currentURL = URL(string: "https://www.facebook.com")!
    
    var body: some View {
        VStack(spacing: 0) {
            WebView(url: currentURL, 
                    reloadTrigger: $reloadTrigger, 
                    canGoBack: $canGoBack, 
                    canGoForward: $canGoForward)
            
            // Navigation Bar
            HStack {
                Button(action: {
                    // Back logic handled via WKWebView directly usually requires a Binding to the WKWebView itself
                    // or a command pattern. For simplicity in this mock, we focus on the UI structure.
                }) {
                    Image(systemName: "chevron.left")
                        .padding()
                }
                .disabled(!canGoBack)
                
                Spacer()
                
                Button(action: {
                    // Forward logic
                }) {
                    Image(systemName: "chevron.right")
                        .padding()
                }
                .disabled(!canGoForward)
                
                Spacer()
                
                Button(action: {
                    currentURL = URL(string: "https://www.facebook.com")!
                    reloadTrigger += 1
                }) {
                    Image(systemName: "house")
                        .padding()
                }
                
                Spacer()
                
                Button(action: {
                    reloadTrigger += 1
                }) {
                    Image(systemName: "arrow.clockwise")
                        .padding()
                }
            }
            .padding(.horizontal)
            .background(Color(.systemGray6))
        }
    }
}

#Preview {
    ContentView()
}
