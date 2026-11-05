// Recorte da pessoa (máscara) com o Vision do macOS — para efeito de camadas (texto/painel atrás da cabeça).
// Uso: recorte <pastaQuadros> <pastaMascaras>   (lê *.png/*.jpg, grava máscara PNG cinza com o mesmo nome)
import Foundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count == 3 else { print("uso: recorte <pastaQuadros> <pastaMascaras>"); exit(1) }
let entrada = URL(fileURLWithPath: args[1]), saida = URL(fileURLWithPath: args[2])
try? FileManager.default.createDirectory(at: saida, withIntermediateDirectories: true)
let ctx = CIContext()
let arquivos = (try FileManager.default.contentsOfDirectory(atPath: entrada.path)).filter { $0.hasSuffix(".png") || $0.hasSuffix(".jpg") }.sorted()
let pedido = VNGeneratePersonSegmentationRequest()
pedido.qualityLevel = .accurate
pedido.outputPixelFormat = kCVPixelFormatType_OneComponent8
for nome in arquivos {
    let url = entrada.appendingPathComponent(nome)
    guard let img = CIImage(contentsOf: url) else { continue }
    try VNImageRequestHandler(ciImage: img).perform([pedido])
    guard let buf = pedido.results?.first?.pixelBuffer else { continue }
    var m = CIImage(cvPixelBuffer: buf)
    m = m.transformed(by: CGAffineTransform(scaleX: img.extent.width / m.extent.width, y: img.extent.height / m.extent.height))
    let destino = saida.appendingPathComponent((nome as NSString).deletingPathExtension + ".png")
    try ctx.writePNGRepresentation(of: m, to: destino, format: .L8, colorSpace: CGColorSpaceCreateDeviceGray())
}
print("\(arquivos.count) máscaras")
