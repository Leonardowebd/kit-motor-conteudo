// OCR com o Vision do macOS (sem dependências). Uso: ocr <imagem> [<imagem>...]
// Uma linha JSON por imagem: palavras, caixas de texto (x,y,w,h normalizados 0–1, origem no topo) e a maior altura de texto.
import Foundation
import Vision
import ImageIO
for caminho in CommandLine.arguments.dropFirst() {
    guard let fonte = CGImageSourceCreateWithURL(URL(fileURLWithPath: caminho) as CFURL, nil), let img = CGImageSourceCreateImageAtIndex(fonte, 0, nil) else { print("{\"arquivo\":\"\(caminho)\",\"erro\":true}"); continue }
    let pedido = VNRecognizeTextRequest(); pedido.recognitionLevel = .accurate; pedido.recognitionLanguages = ["pt-BR", "en-US"]; pedido.usesLanguageCorrection = false
    try? VNImageRequestHandler(cgImage: img, options: [:]).perform([pedido])
    var palavras = 0; var caixas: [[String: Double]] = []; var maior = 0.0; var area = 0.0
    for r in pedido.results ?? [] {
        guard let t = r.topCandidates(1).first else { continue }
        palavras += t.string.split(whereSeparator: { $0 == " " || $0 == "\n" }).count
        let b = r.boundingBox; let y = 1 - b.origin.y - b.size.height
        caixas.append(["x": b.origin.x, "y": y, "w": b.size.width, "h": b.size.height]); maior = max(maior, b.size.height); area += b.size.width * b.size.height
    }
    let nome = (caminho as NSString).lastPathComponent
    let dados = try! JSONSerialization.data(withJSONObject: ["arquivo": nome, "largura": img.width, "altura": img.height, "palavras": palavras, "areaTexto": area, "maiorTexto": maior, "linhas": caixas.count])
    print(String(data: dados, encoding: .utf8)!)
}
