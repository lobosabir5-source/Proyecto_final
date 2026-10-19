package com.Golds_Gym.Gimnasio.Infrastructure.web.controller;

import com.Golds_Gym.Gimnasio.application.dto.ReporteResumenRespuesta;
import com.Golds_Gym.Gimnasio.application.dto.PuntoMensualRespuesta;
import com.Golds_Gym.Gimnasio.application.service.ReporteService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/admin/herramientas")
public class HerramientasAdminController {
    private static final Logger LOG = LoggerFactory.getLogger(HerramientasAdminController.class);
    private final ReporteService reportes;
    @Value("${app.backup.dir:backups}") private String backupDir;
    @Value("${app.backup.pg-dump:pg_dump}") private String pgDump;
    @Value("${spring.datasource.url}") private String jdbcUrl;
    @Value("${spring.datasource.username}") private String dbUser;
    @Value("${spring.datasource.password}") private String dbPassword;
    @Value("${logging.file.name:logs/golds-gym.log}") private String logFile;
    public HerramientasAdminController(ReporteService reportes) { this.reportes = reportes; }

    private LinkedHashMap<String,String> filas(ReporteResumenRespuesta r) {
        LinkedHashMap<String,String> m = new LinkedHashMap<>();
        m.put("Clientes activos", String.valueOf(r.clientesActivos()));
        m.put("Membresias activas", String.valueOf(r.membresiasActivas()));
        m.put("Membresias pendientes", String.valueOf(r.membresiasPendientes()));
        m.put("Membresias por vencer", String.valueOf(r.membresiasPorVencer()));
        m.put("Membresias vencidas", String.valueOf(r.membresiasVencidas()));
        m.put("Asistencias hoy", String.valueOf(r.asistenciasDeHoy()));
        m.put("Ingresos del mes (Bs)", String.valueOf(r.ingresosDelMes()));
        for (PuntoMensualRespuesta x : r.clientesPorMes()) m.put("Clientes / " + x.mes(), String.valueOf(x.valor()));
        for (PuntoMensualRespuesta x : r.ingresosPorMes()) m.put("Ingresos / " + x.mes(), String.valueOf(x.valor()));
        for (PuntoMensualRespuesta x : r.renovacionesPorMes()) m.put("Renovaciones / " + x.mes(), String.valueOf(x.valor()));
        return m;
    }
    private ResponseEntity<byte[]> download(byte[] bytes, String type, String filename) {
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(type))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .header("Cache-Control", "no-store").body(bytes);
    }
    @GetMapping("/reportes/{formato}")
    public ResponseEntity<byte[]> exportar(@PathVariable String formato, Authentication auth) throws IOException {
        LinkedHashMap<String,String> datos = filas(reportes.resumen());
        byte[] out;
        switch(formato.toLowerCase(Locale.ROOT)) {
            case "csv" -> {
                StringBuilder csv = new StringBuilder("Indicador,Valor\r\n");
                datos.forEach((k,v) -> csv.append('"').append(k.replace("\"","\"\"")).append("\",\"").append(v.replace("\"","\"\"")).append("\"\r\n"));
                out = ("\uFEFF" + csv).getBytes(StandardCharsets.UTF_8);
                LOG.info("AUDITORIA usuario={} accion=EXPORTAR_REPORTE formato=csv", auth.getName());
                return download(out,"text/csv; charset=UTF-8","golds-gym-reporte.csv");
            }
            case "xlsx" -> {
                try (Workbook book = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
                    Sheet sheet = book.createSheet("Resumen"); int i=0;
                    Row head=sheet.createRow(i++);head.createCell(0).setCellValue("Indicador");head.createCell(1).setCellValue("Valor");
                    for(var e:datos.entrySet()){Row row=sheet.createRow(i++);row.createCell(0).setCellValue(e.getKey());row.createCell(1).setCellValue(e.getValue());}
                    sheet.setColumnWidth(0, 9500);sheet.setColumnWidth(1, 5000);
                    book.write(bos);out=bos.toByteArray();
                }
                LOG.info("AUDITORIA usuario={} accion=EXPORTAR_REPORTE formato=xlsx", auth.getName());
                return download(out,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","golds-gym-reporte.xlsx");
            }
            case "pdf" -> {
                try(PDDocument doc=new PDDocument();ByteArrayOutputStream bos=new ByteArrayOutputStream()) {
                    PDPage page=new PDPage();doc.addPage(page);
                    try(PDPageContentStream cs=new PDPageContentStream(doc,page)) {
                        cs.beginText();cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD),16);cs.newLineAtOffset(48,745);
                        cs.showText("GOLD'S GYM - REPORTE GENERAL");cs.endText();
                        cs.beginText();cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA),10);cs.newLineAtOffset(48,722);
                        cs.showText("Generado: "+LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));cs.endText();
                        int y=690;
                        for(var e:datos.entrySet()) {if(y<45)break;
                            cs.beginText();cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA),10);cs.newLineAtOffset(48,y);
                            // Las fuentes PDF basicas son WinAnsi; reemplazar caracteres no soportados.
                            cs.showText((e.getKey()+": "+e.getValue()).replaceAll("[^ -~]","?"));cs.endText();y-=22;
                        }
                    }
                    doc.save(bos);out=bos.toByteArray();
                }
                LOG.info("AUDITORIA usuario={} accion=EXPORTAR_REPORTE formato=pdf", auth.getName());
                return download(out,"application/pdf","golds-gym-reporte.pdf");
            }
            default -> throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST,"Formato no permitido");
        }
    }
    @GetMapping("/logs")
    public Map<String,Object> logs(@RequestParam(defaultValue="100") int limite) throws IOException {
        if(limite<1||limite>500) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST,"Limite entre 1 y 500");
        Path file=Path.of(logFile).toAbsolutePath().normalize();
        if(!Files.isRegularFile(file)) return Map.of("lineas",List.of());
        // Evita leer logs sin limite de memoria: maximo 2 MB del final.
        long size=Files.size(file);byte[] tail;
        try(var raf=new RandomAccessFile(file.toFile(),"r")) {long start=Math.max(0,size-2_000_000);raf.seek(start);tail=new byte[(int)(size-start)];raf.readFully(tail);}
        String[] all=new String(tail,StandardCharsets.UTF_8).split("\\R");
        return Map.of("lineas",Arrays.asList(all).subList(Math.max(0,all.length-limite),all.length));
    }
    @GetMapping("/backups")
    public List<Map<String,Object>> backups() throws IOException {
        Path dir=Path.of(backupDir).toAbsolutePath().normalize();if(!Files.isDirectory(dir))return List.of();
        try(var stream=Files.list(dir)) {
            return stream.filter(f->Files.isRegularFile(f)&&f.getFileName().toString().matches("golds-gym-[0-9]{8}-[0-9]{6}\\.dump"))
                .sorted(Comparator.reverseOrder()).limit(50)
                .map(f->{try{return Map.<String,Object>of("nombre",f.getFileName().toString(),"bytes",Files.size(f));}catch(IOException e){return Map.<String,Object>of("nombre",f.getFileName().toString());}}).toList();
        }
    }
    @PostMapping("/backups")
    public Map<String,Object> crearBackup(Authentication auth) throws Exception {
        java.net.URI uri;
        try {uri=java.net.URI.create(jdbcUrl.substring(5));}catch(Exception ex){throw new org.springframework.web.server.ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"URL PostgreSQL invalida");}
        if(!"postgresql".equals(uri.getScheme()))throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST,"Solo PostgreSQL");
        String db=uri.getPath().replaceFirst("^/","");if(!db.matches("[a-zA-Z0-9_-]+"))throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST,"Nombre de BD no valido");
        Path dir=Path.of(backupDir).toAbsolutePath().normalize();Files.createDirectories(dir);
        String name="golds-gym-"+LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"))+".dump";
        Path file=dir.resolve(name);
        List<String> command=List.of(pgDump,"--format=custom","--no-owner","--no-privileges","--host="+uri.getHost(),"--port="+(uri.getPort()>0?uri.getPort():5432),"--username="+dbUser,"--file="+file,db);
        ProcessBuilder pb=new ProcessBuilder(command).redirectErrorStream(true).redirectOutput(ProcessBuilder.Redirect.DISCARD);pb.environment().put("PGPASSWORD",dbPassword);
        Process process=pb.start();boolean finished=process.waitFor(120,TimeUnit.SECONDS);
        if(!finished){process.destroyForcibly();Files.deleteIfExists(file);throw new org.springframework.web.server.ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT,"pg_dump excedio 120 segundos");}
        if(process.exitValue()!=0){Files.deleteIfExists(file);LOG.error("Fallo pg_dump, codigo={}",process.exitValue());throw new org.springframework.web.server.ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Error al crear backup: comprueba pg_dump y la conexion");}
        LOG.info("AUDITORIA usuario={} accion=CREAR_BACKUP archivo={}",auth.getName(),name);
        return Map.of("nombre",name,"bytes",Files.size(file));
    }
    @GetMapping("/backups/{nombre}")
    public ResponseEntity<byte[]> descargarBackup(@PathVariable String nombre,Authentication auth) throws IOException {
        if(!nombre.matches("golds-gym-[0-9]{8}-[0-9]{6}\\.dump"))throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST,"Nombre invalido");
        Path dir=Path.of(backupDir).toAbsolutePath().normalize();Path file=dir.resolve(nombre).normalize();
        if(!file.startsWith(dir)||!Files.isRegularFile(file))throw new org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND,"Backup no encontrado");
        LOG.info("AUDITORIA usuario={} accion=DESCARGAR_BACKUP archivo={}",auth.getName(),nombre);
        return download(Files.readAllBytes(file),"application/octet-stream",nombre);
    }
}
