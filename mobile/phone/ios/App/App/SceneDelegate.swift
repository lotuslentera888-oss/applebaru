import UIKit
import Capacitor
import WebKit

private let appearanceKey = "SimulatorAppearanceMode"
private func interfaceStyle(_ mode: String) -> UIUserInterfaceStyle {
    switch mode {
    case "dark": return .dark
    case "automatic": return .unspecified
    default: return .light
    }
}

@objc(SimulatorAppearancePlugin)
public class SimulatorAppearancePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SimulatorAppearancePlugin"
    public let jsName = "SimulatorAppearance"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setAppearance", returnType: CAPPluginReturnPromise)
    ]

    @objc func setAppearance(_ call: CAPPluginCall) {
        let mode = call.getString("mode") ?? "light"
        guard ["light", "dark", "automatic"].contains(mode) else {
            call.reject("Invalid appearance mode")
            return
        }
        DispatchQueue.main.async { [weak self] in
            guard let controller = self?.bridge?.viewController as? CAPBridgeViewController else {
                call.reject("Appearance view controller unavailable")
                return
            }
            let style = interfaceStyle(mode)
            UserDefaults.standard.set(mode, forKey: appearanceKey)
            controller.overrideUserInterfaceStyle = style
            controller.view.overrideUserInterfaceStyle = style
            controller.view.window?.overrideUserInterfaceStyle = style
            controller.view.window?.backgroundColor = .systemBackground
            controller.view.backgroundColor = .systemBackground
            controller.webView?.overrideUserInterfaceStyle = style
            controller.webView?.backgroundColor = .systemBackground
            controller.webView?.scrollView.backgroundColor = .systemBackground
            controller.setNeedsStatusBarAppearanceUpdate()
            call.resolve(["mode": mode])
        }
    }
}

class AppearanceBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(SimulatorAppearancePlugin())
    }
    override func viewDidLoad() {
        super.viewDidLoad()
        let style = interfaceStyle(UserDefaults.standard.string(forKey: appearanceKey) ?? "light")
        overrideUserInterfaceStyle = style
        view.overrideUserInterfaceStyle = style
        view.backgroundColor = .systemBackground
        webView?.overrideUserInterfaceStyle = style
        webView?.isOpaque = false
        webView?.backgroundColor = .systemBackground
        webView?.scrollView.backgroundColor = .systemBackground
        webView?.scrollView.contentInsetAdjustmentBehavior = .never
    }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        window = UIWindow(windowScene: windowScene)
        window?.overrideUserInterfaceStyle = interfaceStyle(UserDefaults.standard.string(forKey: appearanceKey) ?? "light")
        window?.backgroundColor = .systemBackground
        window?.rootViewController = AppearanceBridgeViewController()
        window?.makeKeyAndVisible()
        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }
    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
