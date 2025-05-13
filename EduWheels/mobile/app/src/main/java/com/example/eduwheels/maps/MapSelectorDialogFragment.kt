package com.example.eduwheels.maps

import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.DialogFragment
import com.example.eduwheels.R
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng

class MapSelectorDialogFragment(
    private val onLocationSelected: (LatLng) -> Unit
) : DialogFragment(), OnMapReadyCallback {

    private lateinit var map: GoogleMap

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val inflater = LayoutInflater.from(requireContext())
        val view: View = inflater.inflate(R.layout.dialog_map_selector, null)

        // Properly add SupportMapFragment using childFragmentManager
        val mapFragment = SupportMapFragment.newInstance()
        childFragmentManager.beginTransaction()
            .replace(R.id.map_container, mapFragment)
            .commitNow() // ensure it’s added before using

        mapFragment.getMapAsync(this)

        return AlertDialog.Builder(requireContext())
            .setView(view)
            .setNegativeButton("Cancel") { dialog, _ -> dialog.dismiss() }
            .create()
    }

    override fun onMapReady(googleMap: GoogleMap) {
        map = googleMap

        val defaultLatLng = LatLng(14.5995, 120.9842)
        map.moveCamera(CameraUpdateFactory.newLatLngZoom(defaultLatLng, 12f))

        map.setOnMapClickListener { latLng ->
            onLocationSelected(latLng)
            dismiss()
        }
    }
}
