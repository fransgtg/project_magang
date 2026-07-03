package com.reportlop.controller; // Sesuaikan dengan nama package kamu

import com.reportlop.model.TabelManual;
import com.reportlop.model.ViewHorasStatus;
import com.reportlop.repository.HorasRepository;
import com.reportlop.repository.ManualRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Sangat penting! Mencegah error CORS saat diakses oleh React JS
public class DataController {

    @Autowired
    private ManualRepository manualRepository;

    @Autowired
    private HorasRepository horasRepository;

    // 1. Endpoint GET untuk Tabel Manual (Pagination & Search)
    @GetMapping("/manual")
    public Page<TabelManual> getManualData(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search) {
        
        Pageable pageable = PageRequest.of(page, size);
        
        if (search.isEmpty()) {
            return manualRepository.findAll(pageable);
        } else {
            // Mencari berdasarkan nama LoP
            return manualRepository.findByLopContainingIgnoreCase(search, pageable);
        }
    }

    // 2. Endpoint GET untuk Tabel Horas (Pagination & Search)
    @GetMapping("/horas")
    public Page<ViewHorasStatus> getHorasData(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search) {
        
        Pageable pageable = PageRequest.of(page, size);
        
        if (search.isEmpty()) {
            return horasRepository.findAll(pageable);
        } else {
            // Mencari berdasarkan nama LoP
            return horasRepository.findByNamaLopContainingIgnoreCase(search, pageable);
        }
    }

    // 3. Endpoint POST untuk Action Sinkronisasi
    @PostMapping("/sync-horas")
    public ResponseEntity<?> syncToManual(@RequestBody TabelManual dataBaru) {
        try {
            // Cek keamanan agar tidak terjadi error duplikat ID
            if (manualRepository.existsById(dataBaru.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Data sudah ada di tabel manual"));
            }
            
            // Menyimpan data yang diklik dari Horas ke tabel_manual
            manualRepository.save(dataBaru);
            return ResponseEntity.ok(Map.of("message", "Berhasil dimasukkan ke Tabel Manual"));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}