// Detecção de rosto com o Vision do macOS (sem dependências).
// Uso: rosto <imagem> [<imagem>...]  → uma linha JSON por imagem:
//   {"arquivo": "...", "largura": W, "altura": H, "rostos": [{"x":..,"y":..,"w":..,"h":..,"yaw":..,"pitch":..,"roll":..}]}
// yaw/pitch/roll em radianos (direção da cabeça): pitch positivo = olhando para baixo (lendo roteiro).
// Coordenadas em pixels, origem no canto superior esquerdo, já com a orientação EXIF aplicada.
import Foundation
import Vision
import ImageIO

func orientacao(_ fonte: CGImageSource) -> CGImagePropertyOrientation {
    let props = CGImageSourceCopyPropertiesAtIndex(fonte, 0, nil) as? [CFString: Any]
    let bruto = props?[kCGImagePropertyOrientation] as? UInt32 ?? 1
    return CGImagePropertyOrientation(rawValue: bruto) ?? .up
}

for caminho in CommandLine.arguments.dropFirst() {
    let url = URL(fileURLWithPath: caminho)
    guard let fonte = CGImageSourceCreateWithURL(url as CFURL, nil),
          let imagem = CGImageSourceCreateImageAtIndex(fonte, 0, nil) else {
        print("{\"arquivo\": \"\(caminho)\", \"erro\": \"não abriu\"}")
        continue
    }
    let ori = orientacao(fonte)
    // Orientações 5–8 giram 90°: largura e altura trocam.
    let gira = [.left, .right, .leftMirrored, .rightMirrored].contains(ori)
    let W = gira ? imagem.height : imagem.width
    let H = gira ? imagem.width : imagem.height
    let pedido = VNDetectFaceRectanglesRequest()
    pedido.revision = VNDetectFaceRectanglesRequestRevision3  // traz pitch além de yaw/roll
    try? VNImageRequestHandler(cgImage: imagem, orientation: ori).perform([pedido])
    let rostos = (pedido.results ?? []).map { r -> String in
        let b = r.boundingBox  // normalizado, origem embaixo à esquerda
        let x = Int(b.minX * CGFloat(W)), w = Int(b.width * CGFloat(W))
        let h = Int(b.height * CGFloat(H)), y = Int((1 - b.maxY) * CGFloat(H))
        let yaw = r.yaw?.doubleValue ?? 0, pitch = r.pitch?.doubleValue ?? 0, roll = r.roll?.doubleValue ?? 0
        return "{\"x\":\(x),\"y\":\(y),\"w\":\(w),\"h\":\(h),\"yaw\":\(yaw),\"pitch\":\(pitch),\"roll\":\(roll)}"
    }
    print("{\"arquivo\": \"\(caminho)\", \"largura\": \(W), \"altura\": \(H), \"rostos\": [\(rostos.joined(separator: ","))]}")
}
